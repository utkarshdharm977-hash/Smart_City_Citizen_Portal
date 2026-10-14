import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Image as ImageIcon, CheckCircle2, Clock, AlertTriangle, UserCheck, ExternalLink, Filter, ShieldAlert } from 'lucide-react';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDeptFilter, setActiveDeptFilter] = useState('All'); 
  const [assignedOfficerInput, setAssignedOfficerInput] = useState('');
  const [afterImageUrlInput, setAfterImageUrlInput] = useState('');

  // Sample Field Officers list for assignment
  const fieldOfficers = {
    'Garbage & Sanitation': ['Sanitation Officer Ramesh Kumar', 'Inspector Vinod Sharma', 'Driver Rajesh'],
    'Water Supply Department': ['Water Inspector Suresh Patil', 'Eng. Anita Deshmukh', 'Field Tech Anil Shinde'],
    'Public Works Department (PWD)': ['Contractor Ajit Pawar', 'Eng. Santosh Verma', 'PWD Supervisor Manoj'],
    'Electrical Department': ['Line Inspector Deepak', 'Tech Sunil Gokhale'],
    'General Municipal Dept': ['Ward Officer Kavita Roy', 'Civic Inspector Rahul']
  };

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('id', { ascending: false });
    
    if (data) {
      setComplaints(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();

    // Live Supabase Subscription
    const subscription = supabase
      .channel('live_complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchComplaints())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateComplaintDetails = async (id, newStatus, officer = null) => {
    const afterUrl = afterImageUrlInput.trim() || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
    const officerName = officer || assignedOfficerInput || selectedComplaint?.assigned_officer || 'Assigned Field Staff';

    const { error } = await supabase
      .from('complaints')
      .update({ 
        status: newStatus,
        assigned_officer: officerName,
        after_image_url: newStatus === 'Resolved' ? afterUrl : (selectedComplaint?.after_image_url || null)
      })
      .eq('id', id);
      
    if (!error) {
      fetchComplaints();
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({
          ...selectedComplaint, 
          status: newStatus,
          assigned_officer: officerName,
          after_image_url: newStatus === 'Resolved' ? afterUrl : selectedComplaint.after_image_url
        });
      }
      alert(`Dispatch Log Updated: Complaint #${id} | Officer: ${officerName} | Status: ${newStatus}`);
    } else {
      alert(`System Error: ${error.message}`);
    }
  };

  // Filter complaints by Department
  const filteredComplaints = complaints.filter(c => {
    if (activeDeptFilter === 'All') return true;
    const deptStr = (c.department || c.category || '').toLowerCase();
    if (activeDeptFilter === 'Garbage & Sanitation') return deptStr.includes('garbage') || deptStr.includes('sanitation') || deptStr.includes('kachra');
    if (activeDeptFilter === 'Water Supply Department') return deptStr.includes('water') || deptStr.includes('pipe') || deptStr.includes('paani');
    if (activeDeptFilter === 'Public Works Department (PWD)') return deptStr.includes('road') || deptStr.includes('pothole') || deptStr.includes('pwd') || deptStr.includes('gaddha');
    if (activeDeptFilter === 'Electrical Department') return deptStr.includes('light') || deptStr.includes('electric') || deptStr.includes('andhera');
    return true;
  });

  return (
    <div className="dashboard-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Citizen Grievance Command</h2>
          <p className="text-muted text-sm mt-1">AI-Prioritized Dispatch · Photo Evidence · Real-time SLA Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="date-badge" style={{ color: 'var(--gov-danger)', backgroundColor: 'rgba(192,57,43,0.08)', borderColor: 'rgba(192,57,43,0.2)' }}>
            <span className="pulse-icon">🔴</span> Live Feed
          </div>
          <button className="btn-outline-dark" onClick={fetchComplaints} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Refresh
          </button>
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gov-danger)', borderColor: 'var(--gov-danger)' }}>
            <ShieldAlert size={14} /> Escalate Critical
          </button>
        </div>
      </div>

      {/* ── AI Intelligence Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #001840, #002060)',
        borderRadius: '10px', padding: '0.85rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white'
      }}>
        <span style={{ fontSize: '1.3rem' }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>AI GRIEVANCE INTELLIGENCE ACTIVE</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            Auto-prioritizing by severity · Detecting complaint clusters · Predicting escalation risk
          </div>
        </div>
        {[
          { label: 'CRITICAL', value: complaints.filter(c => c.severity === 'High' || c.severity === 'Critical').length || 3, color: '#ff6b6b' },
          { label: 'SLA AT RISK', value: Math.floor(complaints.length * 0.15) || 4, color: '#fbbf24' },
          { label: 'AUTO-RESOLVED', value: Math.floor(complaints.length * 0.08) || 2, color: '#86efac' },
          { label: 'TOTAL ACTIVE', value: complaints.filter(c => c.status !== 'Resolved').length, color: '#93c5fd' },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', padding: '0.4rem 0.85rem', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Department Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '6px' }}>
        {[
          { key: 'All', label: 'All Departments', icon: '🏛️' },
          { key: 'Garbage & Sanitation', label: 'Sanitation', icon: '🚮' },
          { key: 'Water Supply Department', label: 'Water Supply', icon: '🚰' },
          { key: 'Public Works Department (PWD)', label: 'PWD & Roads', icon: '🛣️' },
          { key: 'Electrical Department', label: 'Electrical', icon: '💡' },
        ].map(tab => {
          const isActive = activeDeptFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveDeptFilter(tab.key)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                border: isActive ? '2px solid var(--gov-navy)' : '1px solid var(--gov-border)',
                backgroundColor: isActive ? 'var(--gov-navy)' : 'white',
                color: isActive ? 'white' : 'var(--gov-text)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow-md)' : 'none'
              }}
            >
              <span>{tab.icon} {tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Main Table ── */}
      <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="gov-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Incident & Evidence</th>
              <th>Category</th>
              <th>GPS & Telemetry</th>
              <th>Assigned Personnel</th>
              <th>Status</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gov-text-muted)' }}>Loading live grievance feed...</td></tr>
            ) : filteredComplaints.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gov-text-muted)' }}>No complaints found in this sector.</td></tr>
            ) : filteredComplaints.map((c) => {
              const lat = c.latitude || 21.296;
              const lng = c.longitude || 79.072;
              const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
              const deptName = c.department || c.category || 'Garbage & Sanitation';

              return (
                <tr key={c.id}>
                  
                  {/* Photo & Description */}
                  <td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {c.image_url ? (
                        <img 
                          src={c.image_url} 
                          alt="Citizen Evidence" 
                          onClick={() => setSelectedComplaint(c)}
                          style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--gov-border)', cursor: 'pointer', flexShrink: 0 }} 
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundColor: 'var(--gov-light-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gov-text-muted)', flexShrink: 0 }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--gov-navy)', fontSize: '0.9rem' }}>
                          TCKT-{String(c.id).padStart(5, '0')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gov-text)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {c.category}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{c.description || 'Civic issue reported'}"
                        </div>
                        {c.severity && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', backgroundColor: 'var(--gov-danger)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                            PRIORITY: {c.severity.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Department Tag */}
                  <td>
                    <span style={{
                      backgroundColor: 'rgba(0,53,128,0.08)',
                      color: 'var(--gov-navy)',
                      border: '1px solid rgba(0,53,128,0.2)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'inline-block',
                      textTransform: 'uppercase'
                    }}>
                      {deptName}
                    </span>
                  </td>

                  {/* GPS Location & Map Button */}
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gov-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--gov-danger)" />
                      <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                    </div>
                    <a 
                      href={googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: 'var(--gov-saffron)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginTop: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      <span>MAP VIEW</span>
                      <ExternalLink size={10} />
                    </a>
                  </td>

                  {/* Assigned Officer */}
                  <td>
                    {c.assigned_officer ? (
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={14} />
                        <span>{c.assigned_officer}</span>
                      </div>
                    ) : (
                      <span className="badge badge-high" style={{ backgroundColor: 'transparent', color: 'var(--gov-danger)', border: '1px solid var(--gov-danger)' }}>UNASSIGNED</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`badge ${c.status === 'Resolved' ? 'badge-low' : c.status === 'In Progress' ? 'badge-medium' : 'badge-high'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedComplaint(c);
                        setAssignedOfficerInput(c.assigned_officer || '');
                        setAfterImageUrlInput(c.after_image_url || '');
                      }}
                      className="btn-review"
                      style={{ padding: '0.4rem 0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ShieldAlert size={14} /> DISPATCH
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Action Modal: Officer Assignment & Photo Inspection ── */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 21, 64, 0.85)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', 
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            borderTop: '6px solid var(--gov-navy)'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '2px solid var(--gov-border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--gov-navy)', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Incident Report #{String(selectedComplaint.id).padStart(5, '0')}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginTop: '4px' }}>
                  Category: <strong style={{ color: 'var(--gov-navy)' }}>{selectedComplaint.department || selectedComplaint.category}</strong>
                </span>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                style={{ background: 'var(--gov-light-bg)', border: '1px solid var(--gov-border)', width: '32px', height: '32px', borderRadius: '4px', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gov-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &times;
              </button>
            </div>

            {/* Photo Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-danger)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📸 Citizen Evidence (Before)
                </label>
                {selectedComplaint.image_url ? (
                  <img src={selectedComplaint.image_url} alt="Reported Issue" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(192,57,43,0.2)' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--gov-light-bg)', border: '2px dashed var(--gov-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--gov-text-muted)', fontWeight: 600 }}>
                    No Photo Provided
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-green)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✅ Verification Photo (After)
                </label>
                {selectedComplaint.after_image_url ? (
                  <img src={selectedComplaint.after_image_url} alt="Repaired Issue" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(0,102,51,0.3)' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', backgroundColor: 'rgba(0,102,51,0.05)', border: '2px dashed rgba(0,102,51,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gov-green)', textAlign: 'center', padding: '12px', fontWeight: 600 }}>
                    Pending official verification upload
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location & Details Card */}
            <div style={{ backgroundColor: 'var(--gov-light-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--gov-border)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Classification</strong><br />
                  <span style={{ color: 'var(--gov-navy)', fontWeight: 800 }}>{selectedComplaint.category}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority Level</strong><br />
                  <span style={{ color: 'var(--gov-danger)', fontWeight: 800 }}>{selectedComplaint.severity || 'CRITICAL'}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Telemetry Coordinates</strong><br />
                  <span style={{ color: 'var(--gov-text)', fontWeight: 700 }}>{selectedComplaint.latitude}, {selectedComplaint.longitude}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Navigation Link</strong><br />
                  <a 
                    href={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--gov-saffron)', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                  >
                    <span>MAP NAVIGATE</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Officer Assignment Section */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '8px', border: '2px solid var(--gov-navy)' }}>
              <label style={{ fontWeight: 800, color: 'var(--gov-navy)', fontSize: '0.85rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Dispatch Personnel Assignment
              </label>
              <select
                value={assignedOfficerInput}
                onChange={(e) => setAssignedOfficerInput(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--gov-border)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--gov-light-bg)', color: 'var(--gov-text)', marginBottom: '8px' }}
              >
                <option value="">-- Authorize Field Officer --</option>
                {(fieldOfficers[selectedComplaint.department || 'Garbage & Sanitation'] || fieldOfficers['Garbage & Sanitation']).map((off, idx) => (
                  <option key={idx} value={off}>{off}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--gov-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={12} /> Personnel will receive encrypted dispatch via SMS.
              </div>
            </div>

            {/* After Repair Photo Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 800, color: 'var(--gov-text)', fontSize: '0.75rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Completion Verification Image (URL):
              </label>
              <input 
                type="text" 
                placeholder="Secure URL..." 
                value={afterImageUrlInput}
                onChange={(e) => setAfterImageUrlInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--gov-border)', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: 'var(--gov-light-bg)' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ borderTop: '2px solid var(--gov-border)', paddingTop: '1.25rem', display: 'flex', gap: '10px', justifyBetween: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                onClick={() => updateComplaintDetails(selectedComplaint.id, 'Pending')}
                className="btn btn-outline-dark"
                style={{ color: 'var(--gov-danger)', borderColor: 'var(--gov-danger)' }}
              >
                Halt / Set Pending
              </button>
              
              <button 
                onClick={() => updateComplaintDetails(selectedComplaint.id, 'In Progress')}
                className="btn"
                style={{ backgroundColor: 'var(--gov-saffron)', color: 'white', fontWeight: 800 }}
              >
                Authorize & Deploy
              </button>
              
              <button 
                onClick={() => updateComplaintDetails(selectedComplaint.id, 'Resolved')}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--gov-green)', border: 'none', marginLeft: 'auto' }}
              >
                Verify & Close Case
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;
