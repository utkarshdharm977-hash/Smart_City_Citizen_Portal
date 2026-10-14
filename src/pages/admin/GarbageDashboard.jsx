import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Truck, MapPin, AlertCircle, CheckCircle, Users, Activity, Trash2, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './GarbageDashboard.css';

// Fix for default leaflet icons not showing up in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Garbage Truck Icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/5759/5759714.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

export default function GarbageDashboard() {
  const [trucks, setTrucks] = useState([]);
  const [zones, setZones] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' | 'drivers'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Khapa Center coordinates (Corrected to Khapa 441101)
  const mapCenter = [21.411278, 78.9862539];
  const mapRef = useRef(null);

  const locateTruck = (lat, lng) => {
    if (mapRef.current && lat && lng) {
      mapRef.current.flyTo([lat, lng], 18, { duration: 1.5 });
    }
  };

  // Debounced search for suggestions (Restricted to Maharashtra)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          setIsSearching(true);
          // Appending Maharashtra, India to restrict results
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Maharashtra, India')}&limit=5`);
          const data = await response.json();
          
          let results = data || [];
          
          // Special case: If user searches for Khapa, prioritize the correct Khapa 441101
          if (searchQuery.toLowerCase().includes('khapa')) {
            const exactKhapa = {
              lat: "21.411278",
              lon: "78.9862539",
              display_name: "Khapa, Maharashtra 441101, India"
            };
            // Put it at the top
            results = [exactKhapa, ...results.filter(r => !r.display_name.includes('Khapa'))];
          }

          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectLocation = (lat, lon, displayName) => {
    if (mapRef.current) {
      mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 18, { duration: 1.5 });
    }
    setSearchQuery(displayName.split(',')[0]); // Set just the local name
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Hardcode exact override for Khapa to prevent wrong village routing
    if (searchQuery.trim().toLowerCase() === 'khapa') {
      handleSelectLocation("21.411278", "78.9862539", "Khapa, Maharashtra 441101");
      return;
    }
    
    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0].lat, suggestions[0].lon, suggestions[0].display_name);
    }
  };

  useEffect(() => {
    fetchData();

    const truckSub = supabase.channel('garbage_trucks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'garbage_trucks' }, () => fetchData())
      .subscribe();
      
    const driverSub = supabase.channel('drivers_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => fetchData())
      .subscribe();

    return () => { 
      supabase.removeChannel(truckSub); 
      supabase.removeChannel(driverSub); 
    }
  }, []);

  const fetchData = async () => {
    try {
      if (trucks.length === 0 && zones.length === 0) {
        setLoading(true);
      }
      const [trucksRes, zonesRes, driversRes] = await Promise.all([
        supabase.from('garbage_trucks').select('*').order('id'),
        supabase.from('zones').select('*'),
        supabase.from('drivers').select('*')
      ]);
      
      if (trucksRes.data) setTrucks(trucksRes.data);
      if (zonesRes.data) setZones(zonesRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (id) => {
    await supabase.from('drivers').update({ status: 'approved' }).eq('id', id);
    fetchData();
  };

  const deleteDriver = async (id) => {
    await supabase.from('drivers').delete().eq('id', id);
    fetchData();
  };

  // Distance calculator to check if truck is in zone
  const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radius of the earth in m
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; 
    return d;
  };

  // Check and update zone coverage permanently in DB
  useEffect(() => {
    if (trucks.length === 0 || zones.length === 0) return;
    
    const coveredZoneIds = [];
    zones.forEach(zone => {
      if (zone.status === 'red') {
        const activeTrucksList = trucks.filter(t => t.is_active);
        for (const truck of activeTrucksList) {
          if (truck.latitude && truck.longitude) {
            const dist = getDistanceFromLatLonInM(zone.latitude, zone.longitude, truck.latitude, truck.longitude);
            if (dist <= zone.radius_meters) {
              coveredZoneIds.push(zone.id);
              break;
            }
          }
        }
      }
    });

    if (coveredZoneIds.length > 0) {
      Promise.all(coveredZoneIds.map(id => 
        supabase.from('zones').update({ status: 'green', last_visited: new Date().toISOString() }).eq('id', id)
      )).then(() => fetchData());
    }
  }, [trucks, zones]);

  // Process data for UI
  const now = new Date();
  
  // Computed trucks with STALE logic
  const computedTrucks = trucks.map(truck => {
    let is_stale = false;
    let computed_active = truck.is_active;
    if (truck.last_ping_time) {
      const pingTime = new Date(truck.last_ping_time);
      const diffMin = (now - pingTime) / 60000;
      if (diffMin > 5) {
        is_stale = true;
        computed_active = false; // Auto offline if stale for 5+ min
      }
    }
    return { ...truck, is_stale, computed_active };
  });

  const computedZones = zones.map(zone => {
    return { ...zone, isVisited: zone.status === 'green' };
  });

  const activeTrucks = computedTrucks.filter(t => t.computed_active).length;
  const missedWards = computedZones.filter(w => !w.isVisited);
  const pendingDrivers = drivers.filter(d => d.status === 'pending');

  return (
    <div className="dashboard-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Solid Waste Management</h2>
          <p className="text-muted text-sm mt-1">Live tracking of garbage collection vehicles & ward coverage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="date-badge">
            <span className="pulse-icon">🟢</span> Fleet GPS Online
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('tracking')}
              className={`btn ${activeTab === 'tracking' ? 'btn-primary' : 'btn-outline-dark'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center' }}
            >
              <Map size={14} style={{ marginRight: '6px' }} /> Live GPS
            </button>
            <button 
              onClick={() => setActiveTab('drivers')}
              className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-outline-dark'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center' }}
            >
              <Users size={14} style={{ marginRight: '6px' }} /> Personnel
              {pendingDrivers.length > 0 && (
                <span style={{ background: 'var(--gov-danger)', color: 'white', padding: '1px 6px', borderRadius: '10px', marginLeft: '6px', fontSize: '0.7rem' }}>
                  {pendingDrivers.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tracking' && (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="admin-stat-card card-accent-left">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="stat-title">Fleet Size</p>
                  <h3 className="stat-value">{trucks.length}</h3>
                </div>
                <div className="stat-icon-wrap bg-blue-light">
                  <Truck size={20} color="var(--gov-navy)" />
                </div>
              </div>
              <p className="text-sm text-muted">Registered Vehicles</p>
            </div>
            
            <div className="admin-stat-card" style={{ borderTopColor: 'var(--gov-green)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="stat-title">Active Vehicles</p>
                  <h3 className="stat-value">{activeTrucks}</h3>
                </div>
                <div className="stat-icon-wrap bg-green-light">
                  <Activity size={20} color="var(--gov-green)" />
                </div>
              </div>
              <p className="text-sm text-success">Pinged in last 5m</p>
            </div>

            <div className="admin-stat-card" style={{ borderTopColor: 'var(--gov-danger)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="stat-title">Missed Wards</p>
                  <h3 className="stat-value text-danger">{missedWards.length}</h3>
                </div>
                <div className="stat-icon-wrap bg-red-light">
                  <AlertCircle size={20} color="var(--gov-danger)" />
                </div>
              </div>
              <p className="text-sm text-danger">Requires attention</p>
            </div>

            <div className="admin-stat-card" style={{ borderTopColor: 'var(--gov-saffron)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="stat-title">Waste Collected</p>
                  <h3 className="stat-value">12.5T</h3>
                </div>
                <div className="stat-icon-wrap bg-orange-light">
                  <Trash2 size={20} color="var(--gov-saffron)" />
                </div>
              </div>
              <p className="text-sm text-success">Est. today</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Left Col: Map */}
            <div className="admin-chart-card col-span-2" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <h3 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gov-navy)' }}>
                  <MapPin size={18} /> Live Fleet Positioning & Coverage Zones
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search area (Maharashtra)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow click
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', border: '1px solid var(--gov-border)', borderRadius: '4px 0 0 4px', outline: 'none', width: '220px' }}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--gov-border)', borderTop: 'none', borderRadius: '0 0 4px 4px', zIndex: 1000, boxShadow: 'var(--shadow-md)', maxHeight: '200px', overflowY: 'auto' }}>
                          {suggestions.map((s, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleSelectLocation(s.lat, s.lon, s.display_name)}
                              style={{ padding: '8px 12px', fontSize: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--gov-light-bg)', color: 'var(--gov-text)', transition: 'background 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gov-light-bg)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <div style={{ fontWeight: 'bold', color: 'var(--gov-navy)' }}>{s.display_name.split(',')[0]}</div>
                              <div style={{ color: 'var(--gov-text-muted)', fontSize: '0.65rem' }}>{s.display_name.substring(s.display_name.indexOf(',') + 1).trim()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSearching}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', background: 'var(--gov-navy)', color: 'white', border: '1px solid var(--gov-navy)', borderRadius: '0 4px 4px 0', fontWeight: 'bold', cursor: isSearching ? 'not-allowed' : 'pointer' }}
                    >
                      {isSearching ? '...' : 'Search'}
                    </button>
                  </form>
                  <span className="date-badge" style={{ backgroundColor: 'transparent', border: '1px solid var(--gov-border)', color: 'var(--gov-text-muted)', margin: 0 }}>Map View</span>
                </div>
              </div>
              <div style={{ height: '500px', width: '100%' }}>
                <MapContainer center={mapCenter} zoom={18} style={{ height: '100%', width: '100%', zIndex: 1 }} ref={mapRef}>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                    maxNativeZoom={18}
                    maxZoom={21}
                  />
                  
                  {/* Render Zones */}
                  {computedZones.map(zone => (
                    <Circle
                      key={zone.id}
                      center={[zone.latitude, zone.longitude]}
                      radius={zone.radius_meters}
                      pathOptions={{
                        color: zone.isVisited ? 'var(--gov-green)' : 'var(--gov-danger)', // Green or Red
                        fillColor: zone.isVisited ? 'var(--gov-green)' : 'var(--gov-danger)',
                        fillOpacity: 0.25,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div style={{ fontWeight: 800 }}>{zone.name}</div>
                        <div style={{ color: zone.isVisited ? 'var(--gov-green)' : 'var(--gov-danger)', fontWeight: 700 }}>
                          {zone.isVisited ? '✅ Covered Today' : '❌ Pending Collection'}
                        </div>
                      </Popup>
                    </Circle>
                  ))}

                  {/* Render Trucks */}
                  {computedTrucks.map(truck => (
                    <Marker 
                      key={truck.id} 
                      position={[truck.latitude || mapCenter[0], truck.longitude || mapCenter[1]]}
                      icon={truckIcon}
                      opacity={truck.computed_active ? 1.0 : 0.4}
                    >
                      <Popup>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--gov-navy)' }}>{truck.vehicle_number || `Truck #${truck.id}`}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: truck.computed_active ? 'var(--gov-green)' : 'var(--gov-danger)', marginTop: '4px' }}>
                          Status: {truck.computed_active ? '🟢 Active & On Route' : (truck.is_stale ? '🔴 Offline (GPS Lost)' : '⚫ Parked')}
                        </div>
                        {truck.last_ping_time && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '6px' }}>
                            Last Signal: {new Date(truck.last_ping_time).toLocaleTimeString()}
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Right Col: Missed Wards & Controls */}
            <div className="flex flex-col gap-6">
              <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gov-border)' }}>
                  <h3 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="var(--gov-danger)" /> Missed Zones
                  </h3>
                </div>
                <div style={{ padding: '1rem', maxHeight: '180px', overflowY: 'auto', background: 'var(--gov-light-bg)' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {missedWards.length === 0 ? (
                      <li style={{ color: 'var(--gov-green)', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', padding: '1rem' }}>✅ All zones successfully covered today!</li>
                    ) : (
                      missedWards.map(ward => (
                        <li key={ward.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={16} color="var(--gov-danger)" />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ward.name}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gov-border)' }}>
                  <h3 className="chart-title" style={{ margin: 0 }}>Fleet Telemetry Status</h3>
                </div>
                <div style={{ padding: '1rem', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--gov-light-bg)' }}>
                  {loading ? (
                    <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>Loading fleet data...</p>
                  ) : computedTrucks.length === 0 ? (
                    <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>No fleet registered.</p>
                  ) : (
                    computedTrucks.map(truck => (
                      <div key={truck.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'white' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--gov-navy)' }}>{truck.vehicle_number || `Truck #${truck.id}`}</div>
                          <div style={{ fontSize: '0.7rem', color: truck.is_stale ? 'var(--gov-danger)' : 'var(--gov-text-muted)', fontWeight: 600 }}>
                            {truck.is_stale ? 'GPS Signal Lost' : (truck.computed_active ? 'Routing' : 'Stationary')}
                          </div>
                          {truck.latitude && truck.longitude && (
                            <button 
                              onClick={() => locateTruck(truck.latitude, truck.longitude)}
                              style={{ marginTop: '0.5rem', fontSize: '0.7rem', background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                            >
                              <MapPin size={12} /> Map Locate
                            </button>
                          )}
                        </div>
                        <div>
                          <span className={`badge ${truck.computed_active ? 'badge-low' : 'badge-high'}`} style={{ backgroundColor: truck.computed_active ? 'var(--gov-green)' : 'var(--gov-danger)', color: 'white', fontSize: '0.65rem', padding: '2px 6px' }}>
                            {truck.computed_active ? 'ACTIVE' : 'OFFLINE'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'drivers' && (
        <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gov-border)', background: 'var(--gov-light-bg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Users color="var(--gov-navy)" /> Fleet Personnel Management
            </h2>
          </div>
          
          <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Contact Info</th>
                <th>Assigned Vehicle</th>
                <th>Clearance Status</th>
                <th>Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id}>
                  <td style={{ fontWeight: 700, color: 'var(--gov-navy)' }}>{driver.name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{driver.phone}</td>
                  <td style={{ fontWeight: 600 }}>{driver.truck_number}</td>
                  <td>
                    {driver.status === 'pending' ? (
                      <span className="badge badge-medium">PENDING REVIEW</span>
                    ) : (
                      <span className="badge badge-low">CLEARED</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {driver.status === 'pending' && (
                      <button onClick={() => approveDriver(driver.id)} className="btn-review" style={{ background: 'var(--gov-green)', color: 'white', borderColor: 'var(--gov-green)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto' }}>Approve</button>
                    )}
                    <button onClick={() => deleteDriver(driver.id)} className="btn-review" style={{ background: 'white', color: 'var(--gov-danger)', borderColor: 'var(--gov-danger)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto' }}>Revoke</button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gov-text-muted)' }}>No fleet personnel records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
