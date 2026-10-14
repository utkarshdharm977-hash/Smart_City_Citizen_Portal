import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapContainer, TileLayer, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import { Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Map Event Component for Drawing
function DrawEvents({ mode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (mode !== 'none') {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

export default function WardMapping() {
  const [wards] = useState([
    { id: '1', name: 'Ward 1' },
    { id: '2', name: 'Ward 2' },
    { id: '8', name: 'Ward 8' },
    { id: '10', name: 'Ward 10' }
  ]);
  const [selectedWard, setSelectedWard] = useState(null);
  
  // Drawing state
  const [drawMode, setDrawMode] = useState('none'); // 'none', 'boundary', 'galli'
  const [boundaryPoints, setBoundaryPoints] = useState([]); // Array of [lat, lng]
  const [gallis, setGallis] = useState([]); // Array of { id, points: [[lat, lng]] }
  const [currentGalli, setCurrentGalli] = useState([]);
  
  // Customization State
  const [borderWeight, setBorderWeight] = useState(3); // Default thickness
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Default Center (Khapa)
  const defaultCenter = [21.4122, 78.9893];

  useEffect(() => {
    if (selectedWard) {
      fetchWardData(selectedWard.id);
    }
  }, [selectedWard]);

  const fetchWardData = async (wardNo) => {
    setBoundaryPoints([]);
    setGallis([]);
    setDrawMode('none');
    
    // Fetch Boundary
    const { data: bData } = await supabase.from('ward_boundaries').select('coordinates').eq('ward_no', wardNo).maybeSingle();
    if (bData && bData.coordinates) {
      const coords = bData.coordinates.coordinates[0];
      if (coords) {
        setBoundaryPoints(coords.map(c => [c[1], c[0]]));
        if (bData.coordinates.properties?.weight) {
          setBorderWeight(bData.coordinates.properties.weight);
        }
      }
    }

    // Fetch Gallis
    const { data: gData } = await supabase.from('ward_routes').select('*').eq('ward_no', wardNo);
    if (gData) {
      const formattedGallis = gData.map(g => ({
        id: g.id,
        points: g.coordinates.coordinates.map(c => [c[1], c[0]])
      }));
      setGallis(formattedGallis);
    }
  };

  const handleMapClick = (latlng) => {
    if (drawMode === 'boundary') {
      setBoundaryPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    } else if (drawMode === 'galli') {
      setCurrentGalli(prev => [...prev, [latlng.lat, latlng.lng]]);
    }
  };

  const saveBoundary = async () => {
    if (boundaryPoints.length < 3) {
      setError("A boundary needs at least 3 points");
      return;
    }
    
    // Convert to GeoJSON
    const geojson = {
      type: "Polygon",
      properties: { weight: borderWeight },
      coordinates: [[...boundaryPoints.map(p => [p[1], p[0]]), [boundaryPoints[0][1], boundaryPoints[0][0]]]]
    };

    // Upsert logic
    const { data: existing } = await supabase.from('ward_boundaries').select('id').eq('ward_no', selectedWard.id).maybeSingle();
    
    if (existing) {
      await supabase.from('ward_boundaries').update({ coordinates: geojson }).eq('id', existing.id);
    } else {
      await supabase.from('ward_boundaries').insert({ ward_no: selectedWard.id, coordinates: geojson });
    }
    
    setSuccess("Ward boundary saved successfully!");
    setDrawMode('none');
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveGalli = async () => {
    if (currentGalli.length < 2) {
      setError("A galli needs at least 2 points");
      return;
    }

    const geojson = {
      type: "LineString",
      properties: { weight: borderWeight },
      coordinates: currentGalli.map(p => [p[1], p[0]])
    };

    const newGalli = {
      ward_no: selectedWard.id,
      name: `Galli ${gallis.length + 1}`,
      coordinates: geojson
    };

    const { data, error: insertError } = await supabase.from('ward_routes').insert(newGalli).select().single();
    
    if (!insertError && data) {
      setGallis(prev => [...prev, { id: data.id, points: currentGalli }]);
      setCurrentGalli([]);
      setDrawMode('none');
      setSuccess("Galli saved successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError("Failed to save Galli. Did you run the SQL query?");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Map size={32} color="#4f46e5" />
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Ward Mapping</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Ward</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {wards.map(ward => (
                <button
                  key={ward.id}
                  onClick={() => setSelectedWard(ward)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: selectedWard?.id === ward.id ? '#eff6ff' : 'white',
                    border: selectedWard?.id === ward.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: selectedWard?.id === ward.id ? '#1d4ed8' : '#475569'
                  }}
                >
                  {ward.name}
                </button>
              ))}
            </div>
          </div>
          
          {selectedWard && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Border Thickness</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={borderWeight} 
                  onChange={(e) => setBorderWeight(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 'bold', color: '#475569' }}>{borderWeight}px</span>
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            {success && <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}
            {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

            {!selectedWard ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '0.5rem' }}>
                Select a ward from the left sidebar to start mapping.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {drawMode === 'none' ? (
                    <>
                      <button onClick={() => { setDrawMode('boundary'); setBoundaryPoints([]); }} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Draw Boundary</button>
                      <button onClick={() => setDrawMode('galli')} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Draw Galli</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => drawMode === 'boundary' ? setBoundaryPoints(prev => prev.slice(0, -1)) : setCurrentGalli(prev => prev.slice(0, -1))} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Undo</button>
                      <button onClick={() => { setDrawMode('none'); if (drawMode === 'boundary') fetchWardData(selectedWard.id); else setCurrentGalli([]); }} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                      <button onClick={drawMode === 'boundary' ? saveBoundary : saveGalli} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Save {drawMode === 'boundary' ? 'Boundary' : 'Galli'}</button>
                    </>
                  )}
                </div>

                {drawMode !== 'none' && (
                  <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Click on the map to draw points for the {drawMode === 'boundary' ? 'ward boundary (polygon)' : 'street (line)'}.
                  </div>
                )}

                <div style={{ height: '500px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: drawMode !== 'none' ? '3px solid #ef4444' : '2px solid #e2e8f0' }}>
                  <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <DrawEvents mode={drawMode} onMapClick={handleMapClick} />
                    
                    {/* Render Boundary */}
                    {boundaryPoints.length > 0 && (
                      drawMode === 'boundary' 
                        ? <Polyline positions={boundaryPoints} color="#ef4444" weight={borderWeight} />
                        : <Polygon positions={boundaryPoints} color="#ef4444" fillOpacity={0} weight={borderWeight} />
                    )}

                    {/* Render Gallis */}
                    {gallis.map(g => (
                      <Polyline key={g.id} positions={g.points} color="#3b82f6" weight={borderWeight} />
                    ))}

                    {/* Render Current Drawing Galli */}
                    {currentGalli.length > 0 && (
                      <Polyline positions={currentGalli} color="#3b82f6" weight={borderWeight} dashArray="5, 10" />
                    )}
                  </MapContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
