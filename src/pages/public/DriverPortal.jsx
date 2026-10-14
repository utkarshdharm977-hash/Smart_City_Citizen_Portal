import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Truck, MapPin, Power, Clock, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fix for default leaflet icons not showing up in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/5759/5759714.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

function MapEvents({ isEditing, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isEditing) onMapClick(e.latlng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

export default function DriverPortal() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [driver, setDriver] = useState(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Off');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Planned Route Drawing State
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState([]);
  
  const pathRef = React.useRef([]);

  // Fetch initial profile & planned route
  useEffect(() => {
    const savedDriver = localStorage.getItem('driver_profile');
    if (savedDriver) {
      const parsedDriver = JSON.parse(savedDriver);
      setDriver(parsedDriver);
      fetchPlannedRoute(parsedDriver.id);
    }
  }, []);

  const fetchPlannedRoute = async (dId) => {
    try {
      const { data } = await supabase.from('garbage_trucks').select('planned_route').eq('driver_id', dId).single();
      if (data && data.planned_route) {
        setPlannedRoute(data.planned_route);
      }
    } catch(e) {}
  };

  const savePlannedRoute = async () => {
    try {
      await supabase.from('garbage_trucks').update({ planned_route: plannedRoute }).eq('driver_id', driver.id);
      setIsEditingRoute(false);
      setSuccess("Route saved to Server! It will now appear on all mobile apps.");
      setTimeout(() => setSuccess(''), 4000);
    } catch(e) {
      setError("Failed to save route");
    }
  };

  const handleMapClick = (latlng) => {
    setPlannedRoute(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const { data, error: dbError } = await supabase
        .from('drivers')
        .select('*')
        .eq('phone', phone)
        .single();
        
      if (dbError || !data) {
        setError('Driver not found. Please register first.');
        return;
      }
      
      if (data.status !== 'approved') {
        setError('Your account is Pending Admin Approval. Please contact the office.');
        return;
      }
      
      setDriver(data);
      localStorage.setItem('driver_profile', JSON.stringify(data));
    } catch (err) {
      setError('Connection error.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // 1. Create driver
      const { data, error: dbError } = await supabase
        .from('drivers')
        .insert([{ name, phone, truck_number: truckNumber, status: 'pending' }])
        .select()
        .single();
        
      if (dbError) {
        console.error("DB Error:", dbError);
        if (dbError.code === '23505') setError('Phone number already registered!');
        else setError(`Error: ${dbError.message || JSON.stringify(dbError)}`);
        return;
      }

      // 2. Also register the truck in garbage_trucks if it doesn't exist
      await supabase.from('garbage_trucks')
        .insert([{ vehicle_number: truckNumber, is_active: false, driver_id: data.id }])
        .select()
        .single()
        // Ignore error if truck already exists (though we should ideally handle it gracefully)
        .catch(e => console.log('Truck might already exist'));

      setSuccess('Registration successful! Waiting for Admin Approval.');
      setIsRegistering(false);
    } catch (err) {
      setError('Connection error.');
    }
  };

  const handleLogout = () => {
    stopTracking();
    localStorage.removeItem('driver_profile');
    setDriver(null);
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('GPS is not supported by your browser.');
      return;
    }

    setLocationStatus('Searching GPS...');
    setIsOnDuty(true);

    // Fetch previous path for today to avoid overwriting it
    try {
      const { data } = await supabase.from('garbage_trucks').select('todays_path, last_reset_date').eq('driver_id', driver.id).single();
      const today = new Date().toISOString().split('T')[0];
      if (data && data.last_reset_date === today && Array.isArray(data.todays_path)) {
        pathRef.current = data.todays_path;
      } else {
        pathRef.current = []; // New day, clear path!
      }
    } catch(e) {
      console.log('Error fetching initial path', e);
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setLocationStatus('GPS Active');
        
        const today = new Date().toISOString().split('T')[0];

        // Only add point if moved > 5 meters to prevent lag
        let shouldAdd = true;
        if (pathRef.current.length > 0) {
           const lastP = pathRef.current[pathRef.current.length - 1]; // [lng, lat]
           const dist = getDistanceInMeters(lastP[1], lastP[0], latitude, longitude);
           if (dist < 5) shouldAdd = false;
        }

        if (shouldAdd) {
           pathRef.current = [...pathRef.current, [longitude, latitude]];
        }
        
        try {
          await supabase.from('garbage_trucks')
            .upsert({ 
              vehicle_number: driver.truck_number,
              driver_id: driver.id,
              latitude, 
              longitude, 
              is_active: true,
              todays_path: pathRef.current,
              last_reset_date: today,
              last_ping_time: new Date().toISOString()
            }, { onConflict: 'vehicle_number' });
        } catch(e) {
          console.error("Failed to update GPS");
        }
      },
      (error) => {
        setLocationStatus('GPS Error - Please enable location');
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    
    setWatchId(id);
  };

  const stopTracking = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setCurrentLocation(null);
    setLocationStatus('Off');
    setIsOnDuty(false);
    
    if (driver) {
      await supabase.from('garbage_trucks')
        .update({ is_active: false })
        .eq('driver_id', driver.id);
    }
  };

  // Login & Registration Screen
  if (!driver) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', marginBottom: '1rem' }}>
              <Truck size={32} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {isRegistering ? 'Driver Registration' : 'Driver Login'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {isRegistering ? 'Register your truck for duty' : 'Enter your registered mobile number'}
            </p>
          </div>
          
          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>}
          {success && <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>{success}</div>}
          
          {!isRegistering ? (
            <form onSubmit={handleLogin}>
              <input 
                type="tel" 
                placeholder="Mobile Number (e.g. 9876543210)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LogIn size={20} /> Login to Portal
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Don't have an account? </span>
                <button type="button" onClick={() => setIsRegistering(true)} style={{ color: '#4f46e5', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>Register Here</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}
                required
              />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}
                required
              />
              <input 
                type="text" 
                placeholder="Truck Number (e.g. MH-31-CB-1234)" 
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} /> Register Truck
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Already registered? </span>
                <button type="button" onClick={() => setIsRegistering(false)} style={{ color: '#4f46e5', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#4f46e5', color: 'white', padding: '1.5rem 1rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck /> <span style={{ fontWeight: 'bold' }}>Driver Portal</span>
          </div>
          <button onClick={handleLogout} style={{ color: '#c7d2fe', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>Logout</button>
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: '#c7d2fe', fontSize: '0.875rem' }}>Welcome back,</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{driver.name}</h2>
          <p style={{ color: '#c7d2fe', fontSize: '0.875rem', marginTop: '0.25rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
            Truck: {driver.truck_number}
          </p>
        </div>
      </div>
      
      {/* Main Card */}
      <div style={{ padding: '0 1rem', marginTop: '-1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: isOnDuty ? '#dcfce7' : '#f1f5f9', color: isOnDuty ? '#16a34a' : '#64748b', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            <MapPin size={16} /> 
            GPS: {locationStatus}
          </div>
          
          {error && <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

          {isOnDuty ? (
            <button 
              onClick={stopTracking}
              style={{ width: '100%', height: '180px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: '8px solid #fee2e2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              <Power size={48} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>END DUTY</span>
            </button>
          ) : (
            <button 
              onClick={startTracking}
              style={{ width: '100%', height: '180px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', border: '8px solid #dcfce7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              <Power size={48} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>START DUTY</span>
            </button>
          )}
          
            <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
              {isOnDuty 
                ? "Keep this app open or running in the background while working." 
                : "Press the big green button when you start your route."}
            </p>

            {/* Route Editor Box */}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🗺 Draw Planned Route</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Use laptop mouse to draw the exact path</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isEditingRoute && (
                    <>
                      <button onClick={() => setPlannedRoute(prev => prev.slice(0, -1))} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Undo</button>
                      <button onClick={() => setPlannedRoute([])} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Clear</button>
                      <button onClick={savePlannedRoute} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                    </>
                  )}
                  {!isEditingRoute && (
                    <button onClick={() => setIsEditingRoute(true)} style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Edit Route</button>
                  )}
                </div>
              </div>
              {isEditingRoute && <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>Click directly on the map below to draw the red line (the planned path).</div>}
            </div>
            
            {/* Map rendering */}
            <div style={{ marginTop: '1rem', height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: isEditingRoute ? '3px solid #ef4444' : '2px solid #e2e8f0' }}>
              <MapContainer center={currentLocation || [21.4120, 78.9890]} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri'
                />
                <MapEvents isEditing={isEditingRoute} onMapClick={handleMapClick} />
                
                {plannedRoute.length > 1 && (
                  <Polyline positions={plannedRoute} color="#ef4444" weight={5} opacity={0.6} />
                )}
                
                {pathRef.current.length > 1 && (
                  <Polyline positions={pathRef.current.map(p => [p[1], p[0]])} color="#10b981" weight={5} opacity={0.8} />
                )}

                {currentLocation && (
                  <Marker position={currentLocation} icon={truckIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}
                {currentLocation && !isEditingRoute && <MapRecenter lat={currentLocation[0]} lng={currentLocation[1]} />}
              </MapContainer>
            </div>
          </div>
        </div>
      
      {/* Alert Warning */}
      <div style={{ padding: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
          <AlertCircle color="#d97706" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
            Make sure you give <strong>"Always Allow"</strong> location permission when prompted for accurate background tracking.
          </p>
        </div>
      </div>
      
    </div>
  );
}
