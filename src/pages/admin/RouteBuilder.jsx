import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapContainer, TileLayer, Polyline, useMapEvents, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Save, Trash2, Undo } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
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

export default function RouteBuilder() {
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [plannedRoute, setPlannedRoute] = useState([]);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    const { data } = await supabase.from('garbage_trucks').select('*');
    if (data) setTrucks(data);
  };

  const handleSelectTruck = (truck) => {
    setSelectedTruck(truck);
    setPlannedRoute(truck.planned_route || []);
    setIsEditingRoute(false);
  };

  const savePlannedRoute = async () => {
    if (!selectedTruck) return;
    try {
      await supabase.from('garbage_trucks').update({ planned_route: plannedRoute }).eq('id', selectedTruck.id);
      setIsEditingRoute(false);
      setSuccess("Route saved to Server! It will now appear on all mobile apps.");
      setTimeout(() => setSuccess(''), 4000);
      
      // Update local state
      setTrucks(trucks.map(t => t.id === selectedTruck.id ? { ...t, planned_route: plannedRoute } : t));
    } catch(e) {
      setError("Failed to save route");
    }
  };

  const handleMapClick = (latlng) => {
    setPlannedRoute(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <MapIcon size={32} color="#4f46e5" />
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Route Builder</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar for truck selection */}
        <div style={{ width: '300px', flexShrink: 0, backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Truck</h3>
          {trucks.map(truck => (
            <div 
              key={truck.id}
              onClick={() => handleSelectTruck(truck)}
              style={{
                padding: '1rem', 
                marginBottom: '0.5rem', 
                borderRadius: '0.5rem',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedTruck?.id === truck.id ? '#4f46e5' : '#e2e8f0',
                backgroundColor: selectedTruck?.id === truck.id ? '#e0e7ff' : '#f8fafc'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{truck.vehicle_number}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{truck.planned_route?.length ? 'Route Configured' : 'No Route'}</div>
            </div>
          ))}
          {trucks.length === 0 && <p>No trucks found.</p>}
        </div>

        {/* Main Map Area */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {selectedTruck ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Map for {selectedTruck.vehicle_number}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Use laptop mouse to draw the exact path</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isEditingRoute && (
                    <>
                      <button onClick={() => setPlannedRoute(prev => prev.slice(0, -1))} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}><Undo size={16}/> Undo</button>
                      <button onClick={() => setPlannedRoute([])} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}><Trash2 size={16}/> Clear</button>
                      <button onClick={savePlannedRoute} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}><Save size={16}/> Save</button>
                    </>
                  )}
                  {!isEditingRoute && (
                    <button onClick={() => setIsEditingRoute(true)} style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Edit Route</button>
                  )}
                </div>
              </div>
              
              {success && <div style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</div>}
              {isEditingRoute && <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>Click directly on the map below to draw the red line (the planned path).</div>}
              
              <div style={{ height: '500px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: isEditingRoute ? '3px solid #ef4444' : '2px solid #e2e8f0' }}>
                <MapContainer center={[21.4120, 78.9890]} zoom={18} maxZoom={22} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                    maxZoom={22}
                    maxNativeZoom={18}
                  />
                  <MapEvents isEditing={isEditingRoute} onMapClick={handleMapClick} />
                  
                  {plannedRoute.length > 1 && (
                    <Polyline positions={plannedRoute} color="#ef4444" weight={5} opacity={0.6} />
                  )}
                </MapContainer>
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Select a truck from the left sidebar to edit its route.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
