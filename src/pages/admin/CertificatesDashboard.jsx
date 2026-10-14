import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, XCircle, Filter, Download, 
  UserCheck, ShieldCheck, Search, Cpu, QrCode, Eye,
  Printer, Send, AlertTriangle, BarChart2, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const applicationData = [
  { day: 'Mon', applications: 12, approved: 10, rejected: 1 },
  { day: 'Tue', applications: 19, approved: 15, rejected: 2 },
  { day: 'Wed', applications: 15, approved: 14, rejected: 0 },
  { day: 'Thu', applications: 22, approved: 18, rejected: 3 },
  { day: 'Fri', applications: 28, approved: 25, rejected: 1 },
  { day: 'Sat', applications: 10, approved: 8, rejected: 1 },
  { day: 'Sun', applications: 5, approved: 5, rejected: 0 },
];

const certTypes = [
  { name: 'Birth', value: 42, color: '#003580' },
  { name: 'Marriage', value: 28, color: '#FF6200' },
  { name: 'Death', value: 18, color: '#C0392B' },
  { name: 'Domicile', value: 8, color: '#006633' },
  { name: 'Income', value: 4, color: '#C8960C' },
];

const pendingApprovals = [
  { id: 'C-091', type: 'Birth Certificate', applicant: 'Suresh Patil', date: '2026-07-19', status: 'Verification Pending', urgency: 'Normal', docs: 4, sla: '2 days left' },
  { id: 'C-092', type: 'Marriage Certificate', applicant: 'Priya & Rahul', date: '2026-07-18', status: 'Document Review', urgency: 'High', docs: 6, sla: '1 day left' },
  { id: 'C-093', type: 'Death Certificate', applicant: 'Amit Singh', date: '2026-07-17', status: 'Final Sign-off', urgency: 'Urgent', docs: 3, sla: 'SLA BREACHED' },
  { id: 'C-094', type: 'Birth Certificate', applicant: 'Neha Gupta', date: '2026-07-20', status: 'Verification Pending', urgency: 'Normal', docs: 4, sla: '4 days left' },
];

const fraudAlerts = [
  { id: 'FA-01', type: 'Duplicate Application', cert: 'Birth Certificate', name: 'Ramesh Yadav', confidence: '94%', matched: 'C-0821 (2024)' },
  { id: 'FA-02', type: 'Document Tampering', cert: 'Income Certificate', name: 'XYZ Enterprises', confidence: '87%', matched: 'OCR Signature Mismatch' },
];

const issuedCerts = [
  { id: 'CERT-8291', type: 'Birth', name: 'Baby Kumar', date: '10 Jul 2026', verified: true },
  { id: 'CERT-8290', type: 'Marriage', name: 'Anita & Ravi', date: '09 Jul 2026', verified: true },
  { id: 'CERT-8289', type: 'Death', name: 'Late G. Patil', date: '08 Jul 2026', verified: true },
];

const CertificatesDashboard = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);
  const [digitalSig, setDigitalSig] = useState(false);
  const [printQueue, setPrintQueue] = useState([]);

  const approve = (id) => { setApprovedIds(p => [...p, id]); };
  const reject = (id) => { setRejectedIds(p => [...p, id]); };
  const addToPrint = (id) => { setPrintQueue(p => [...p, id]); alert(`Certificate ${id} added to print queue. Digital signature will be applied automatically.`); };

  return (
    <div className="dashboard-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Civic Certificates & Records</h2>
          <p className="text-muted text-sm mt-1">Blockchain-secured registry · AI fraud detection · Digital signature workflow</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="date-badge" style={{ color: 'var(--gov-navy)', backgroundColor: 'rgba(0,53,128,0.08)', borderColor: 'rgba(0,53,128,0.2)' }}>
            <span className="pulse-icon">🏛️</span> Registry Active
          </div>
          {printQueue.length > 0 && (
            <button style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', background: 'var(--gov-saffron)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={14} /> Print Queue ({printQueue.length})
            </button>
          )}
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
            <Download size={14} style={{ marginRight: '6px' }} /> Export Ledger
          </button>
        </div>
      </div>

      {/* ── Blockchain Security Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a2e, #1a1a5e)',
        borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🔗</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
            BLOCKCHAIN CERTIFICATE REGISTRY — TAMPER-PROOF · DIGITALLY SIGNED
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            All certificates are cryptographically signed and stored on state blockchain. Citizens can verify authenticity using QR code.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { label: 'CHAIN HEIGHT', value: '8,452' },
            { label: 'VERIFIED TODAY', value: '1,240' },
            { label: 'FRAUD BLOCKED', value: '2' },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', padding: '0.5rem 0.85rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{m.value}</div>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--gov-border)', width: 'fit-content' }}>
        {[
          { id: 'queue', label: '📋 Processing Queue' },
          { id: 'analytics', label: '📊 Analytics' },
          { id: 'fraud', label: '🚨 AI Fraud Detection' },
          { id: 'verify', label: '🔍 Verify Certificate' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '0.4rem 1rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: activeTab === tab.id ? 'var(--gov-navy)' : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--gov-text-muted)'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Issued (YTD)', value: '8,452', sub: '↑ 111 this week', color: 'var(--gov-navy)', bg: 'bg-blue-light', icon: <FileText size={20} color="var(--gov-navy)" /> },
          { title: 'Pending Approvals', value: '42', sub: 'Avg: 3 days processing', color: 'var(--gov-saffron)', bg: 'bg-orange-light', icon: <Clock size={20} color="var(--gov-saffron)" /> },
          { title: 'Approved Today', value: '15', sub: '100% within SLA', color: 'var(--gov-green)', bg: 'bg-green-light', icon: <CheckCircle size={20} color="var(--gov-green)" /> },
          { title: 'SLA Breach Risk', value: '3', sub: 'Action required today', color: 'var(--gov-danger)', bg: 'bg-red-light', icon: <AlertTriangle size={20} color="var(--gov-danger)" /> },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card" style={{ borderTopColor: card.color }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="stat-title">{card.title}</p>
                <h3 className="stat-value" style={{ color: card.color }}>{card.value}</h3>
              </div>
              <div className={`stat-icon-wrap ${card.bg}`}>{card.icon}</div>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: card.color }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── QUEUE TAB ── */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-2 gap-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Document Processing Queue</h3>
            {pendingApprovals.map((app, idx) => {
              const isApproved = approvedIds.includes(app.id);
              const isRejected = rejectedIds.includes(app.id);
              return (
                <div key={idx} style={{
                  padding: '1.25rem', border: `1px solid ${app.urgency === 'Urgent' ? 'rgba(192,57,43,0.3)' : 'var(--gov-border)'}`,
                  borderLeft: `4px solid ${app.urgency === 'Urgent' ? 'var(--gov-danger)' : app.urgency === 'High' ? 'var(--gov-saffron)' : 'var(--gov-navy)'}`,
                  borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  opacity: isApproved || isRejected ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--gov-navy)', fontWeight: 800 }}>{app.type}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)', marginLeft: '8px' }}>{app.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {app.urgency === 'Urgent' && <span style={{ fontSize: '0.65rem', background: 'var(--gov-danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>URGENT</span>}
                      <span style={{ fontSize: '0.7rem', color: app.sla.includes('BREACHED') ? 'var(--gov-danger)' : 'var(--gov-text-muted)', fontWeight: 700 }}>⏱ {app.sla}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--gov-text)' }}>👤 {app.applicant}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>📎 {app.docs} documents</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--gov-border)', paddingTop: '10px' }}>
                    <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>{app.status.toUpperCase()}</span>
                    {isApproved ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--gov-green)', fontSize: '0.8rem', fontWeight: 700 }}>✓ Approved</span>
                        <button onClick={() => addToPrint(app.id)} style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,53,128,0.1)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Printer size={11} /> Issue & Print
                        </button>
                      </div>
                    ) : isRejected ? (
                      <span style={{ color: 'var(--gov-danger)', fontSize: '0.8rem', fontWeight: 700 }}>✗ Rejected</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => approve(app.id)} style={{ padding: '4px 10px', background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', border: '1px solid rgba(0,102,51,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button style={{ padding: '4px 10px', background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} /> Preview
                        </button>
                        <button onClick={() => reject(app.id)} style={{ padding: '4px 8px', background: 'rgba(192,57,43,0.08)', color: 'var(--gov-danger)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '4px', cursor: 'pointer' }}>
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Issued Certs */}
          <div>
            <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Recently Issued Certificates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {issuedCerts.map((cert, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', background: 'white', border: '1px solid rgba(0,102,51,0.2)', borderLeft: '4px solid var(--gov-green)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📜</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--gov-navy)' }}>{cert.type} Certificate</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>{cert.name} · {cert.date}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gov-green)', fontWeight: 700, marginTop: '2px' }}>🔗 Blockchain ID: {cert.id}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>✓ VERIFIED</span>
                    <button style={{ padding: '3px 8px', fontSize: '0.68rem', fontWeight: 700, background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)', borderRadius: '4px', cursor: 'pointer' }}>
                      📱 QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-chart-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="chart-title">Certificate Type Distribution</h3>
              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={certTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value">
                      {certTypes.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {certTypes.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gov-text-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }}></div>
                    {c.name}: {c.value}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="admin-chart-card">
          <h3 className="chart-title">Application Intake vs Processing Trend</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <AreaChart data={applicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gov-navy)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--gov-navy)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gov-green)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--gov-green)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="var(--gov-navy)" strokeWidth={2} fillOpacity={1} fill="url(#colorIntake)" />
                <Area type="monotone" dataKey="approved" name="Certificates Issued" stroke="var(--gov-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── AI FRAUD DETECTION TAB ── */}
      {activeTab === 'fraud' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1a5e)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Cpu size={20} color="#a855f7" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>AI FRAUD DETECTION ENGINE — {fraudAlerts.length} SUSPICIOUS APPLICATIONS</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>OCR signature analysis · Duplicate fingerprint matching · Document tamper detection</div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>● MODEL ACTIVE</span>
          </div>
          {fraudAlerts.map((alert, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid rgba(139,92,246,0.3)', borderLeft: '4px solid #7c3aed',
              borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
              <span style={{ fontSize: '2rem' }}>🔍</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>{alert.type}</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>AI FLAGGED</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text)' }}>
                  Certificate: <strong>{alert.cert}</strong> · Applicant: <strong>{alert.name}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '2px' }}>Matched with: {alert.matched}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>{alert.confidence}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>AI CONFIDENCE</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button style={{ padding: '6px 12px', background: 'rgba(192,57,43,0.1)', color: 'var(--gov-danger)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  🚫 Reject & Flag
                </button>
                <button style={{ padding: '6px 12px', background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  👁 Full Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VERIFY CERTIFICATE TAB ── */}
      {activeTab === 'verify' && (
        <div className="admin-chart-card">
          <h3 className="chart-title">Certificate Verification Portal</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-muted)', marginBottom: '1.5rem' }}>
            Verify any certificate using its Blockchain ID or QR code scan. Provides tamper-proof verification status.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Enter Certificate ID or Blockchain Hash..."
                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--gov-border)', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'var(--font-main)', outline: 'none' }} />
            </div>
            <button className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', whiteSpace: 'nowrap' }}>🔍 Verify Now</button>
            <button style={{ padding: '0.85rem 1.2rem', border: '1px solid var(--gov-border)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📷 Scan QR Code
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {issuedCerts.map((cert, i) => (
              <div key={i} style={{ padding: '1.25rem', background: 'rgba(0,102,51,0.03)', border: '1px solid rgba(0,102,51,0.15)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📜</span>
                  <span style={{ fontWeight: 800, color: 'var(--gov-navy)' }}>{cert.type} Certificate</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text)', marginBottom: '0.3rem' }}>{cert.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>Issued: {cert.date}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--gov-green)', fontWeight: 700, marginTop: '4px', fontFamily: 'monospace' }}>{cert.id}</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(0,102,51,0.12)', color: 'var(--gov-green)', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>🔗 VERIFIED ON CHAIN</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesDashboard;
