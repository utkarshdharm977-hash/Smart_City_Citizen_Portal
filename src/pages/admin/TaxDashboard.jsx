import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building, TrendingUp, AlertCircle, FileText, Filter, Download,
  Calendar, Search, CheckCircle, Clock, ArrowRight, Cpu,
  AlertOctagon, Zap, Mail, MessageSquare, Phone, Eye, RefreshCw,
  Home, Store, MapPin, User, IndianRupee, X, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { KHAPA_PROPERTIES } from '../../data/khapaLandRecords';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

const taxData = [
  { zone: 'North', residential: 45000, commercial: 84000, industrial: 12000 },
  { zone: 'South', residential: 52000, commercial: 65000, industrial: 8000 },
  { zone: 'East', residential: 38000, commercial: 92000, industrial: 24000 },
  { zone: 'West', residential: 61000, commercial: 48000, industrial: 5000 },
  { zone: 'Central', residential: 85000, commercial: 145000, industrial: 18000 },
];

const collectionTrend = [
  { month: 'Apr', amount: 42, target: 50 },
  { month: 'May', amount: 58, target: 55 },
  { month: 'Jun', amount: 85, target: 60 },
  { month: 'Jul', amount: 65, target: 65 },
  { month: 'Aug', amount: 72, target: 70 },
  { month: 'Sep', amount: 95, target: 80 },
];

const propertyTypes = [
  { name: 'Residential', value: 45 },
  { name: 'Commercial', value: 35 },
  { name: 'Industrial', value: 15 },
  { name: 'Vacant Land', value: 5 }
];
const COLORS = ['#003580', '#FF6200', '#006633', '#C8960C'];

const recentPayments = [
  { id: 'TXN-89302', property: 'P-10024', name: 'Rajesh Kumar', amount: '₹ 12,450', date: 'Today, 10:24 AM', status: 'Success', method: 'UPI' },
  { id: 'TXN-89301', property: 'P-40291', name: 'Sunita Sharma', amount: '₹ 8,200', date: 'Today, 09:15 AM', status: 'Success', method: 'Net Banking' },
  { id: 'TXN-89300', property: 'C-20938', name: 'Metro Plaza', amount: '₹ 1,45,000', date: 'Yesterday', status: 'Pending', method: 'NEFT' },
  { id: 'TXN-89299', property: 'P-11843', name: 'Anil Desai', amount: '₹ 4,500', date: 'Yesterday', status: 'Success', method: 'UPI' },
];

const defaulters = [
  { id: 'T-842', name: 'ABC Corp', amount: '₹ 12.4L', zone: 'Central', due: '120 days', status: 'Legal Action', risk: 'HIGH' },
  { id: 'T-911', name: 'Ramesh Singh', amount: '₹ 1.2L', zone: 'South', due: '90 days', status: 'Notice Sent', risk: 'MEDIUM' },
  { id: 'T-302', name: 'City Mall', amount: '₹ 8.5L', zone: 'East', due: '150 days', status: 'Legal Action', risk: 'HIGH' },
  { id: 'T-447', name: 'Green Valley Apts', amount: '₹ 3.8L', zone: 'North', due: '60 days', status: 'Pending', risk: 'MEDIUM' },
];

const selfAssessments = [
  { id: 'SA-1201', pid: 'P-28492', name: 'Priya Nair', area: '1250 sqft', declared: '₹ 8,200', ai_assessed: '₹ 11,400', variance: '+39%', flag: true },
  { id: 'SA-1202', pid: 'C-38291', name: 'NK Traders', area: '3200 sqft', declared: '₹ 45,000', ai_assessed: '₹ 47,200', variance: '+4.9%', flag: false },
  { id: 'SA-1203', pid: 'P-19202', name: 'Sanjay Mehta', area: '800 sqft', declared: '₹ 4,100', ai_assessed: '₹ 9,800', variance: '+139%', flag: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColor = (s) => {
  if (s === 'Paid') return { bg: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)' };
  if (s === 'Defaulter') return { bg: 'rgba(192,57,43,0.1)', color: 'var(--gov-danger)' };
  if (s === 'Partial') return { bg: 'rgba(255,98,0,0.1)', color: 'var(--gov-saffron)' };
  return { bg: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)' };
};

const typeIcon = (subtype) => {
  if (subtype === 'Shop' || subtype === 'Shopping Mall' || subtype === 'Godown') return <Store size={14} />;
  if (subtype === 'Plot') return <MapPin size={14} />;
  return <Home size={14} />;
};

const fmtINR = (n) => {
  if (!n) return '₹ 0';
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)}L`;
  return `₹ ${Number(n).toLocaleString('en-IN')}`;
};

// ── Main Component ────────────────────────────────────────────────────────────
const TaxDashboard = () => {
  const [fiscalYear, setFiscalYear] = useState('2026-27');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchPID, setSearchPID] = useState('');
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedDefaulters, setSelectedDefaulters] = useState([]);
  const [noticesSent, setNoticesSent] = useState(false);

  // Owner Search State
  const [ownerQuery, setOwnerQuery] = useState('');
  const [ownerResults, setOwnerResults] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState('');
  const [searchedName, setSearchedName] = useState('');

  const toggleDefaulter = (id) => {
    setSelectedDefaulters(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const sendBulkNotices = () => {
    setNoticesSent(true);
    setTimeout(() => setNoticesSent(false), 3000);
  };

  // ── Search by Owner Name (Khapa 441101 MahaBhulekh + Supabase) ──
  const handleOwnerSearch = useCallback(async (overrideQuery) => {
    const rawQuery = (typeof overrideQuery === 'string' ? overrideQuery : ownerQuery).trim();
    if (!rawQuery) return;
    
    setOwnerLoading(true);
    setOwnerError('');
    setOwnerResults([]);
    setSearchedName(rawQuery);

    const q = rawQuery.toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);

    // Search local authentic Khapa records (matches all words, e.g. "Sunita Deshmukh" matches "Sunita Rameshwar Deshmukh")
    const localMatches = KHAPA_PROPERTIES.filter(p => {
      const en = p.owner_name.toLowerCase();
      const mr = (p.owner_name_mr || '').toLowerCase();
      const pid = (p.pid || '').toLowerCase();
      const survey = (p.survey_number || '').toLowerCase();
      const cts = (p.cts_number || '').toLowerCase();

      // Check if all tokens match English or Marathi name
      const matchesTokens = tokens.every(tok => en.includes(tok) || mr.includes(tok));
      const matchesDirect = en.includes(q) || mr.includes(q) || pid.includes(q) || survey.includes(q) || cts.includes(q);

      return matchesTokens || matchesDirect;
    });

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .ilike('owner_name', `%${tokens[0] || rawQuery}%`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Filter supabase results with all tokens
        const filteredSupabase = data.filter(d => 
          tokens.every(tok => d.owner_name.toLowerCase().includes(tok))
        );
        setOwnerResults(filteredSupabase.length > 0 ? filteredSupabase : localMatches);
      } else {
        setOwnerResults(localMatches);
      }
    } catch (err) {
      // Offline fallback
      setOwnerResults(localMatches);
    } finally {
      setOwnerLoading(false);
    }
  }, [ownerQuery]);

  const clearSearch = () => {
    setOwnerQuery('');
    setOwnerResults([]);
    setSearchedName('');
    setOwnerError('');
  };

  return (
    <div className="dashboard-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Property Tax Assessment & Revenue</h2>
          <p className="text-muted text-sm mt-1">AI-Assisted Assessment · Auto-Notice Generation · Real-time Collection Tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="date-badge">
            <span className="pulse-icon">🟢</span> Live Revenue Tracking
          </div>
          <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}
            className="btn-outline-dark" style={{ padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem' }}>
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Download size={14} style={{ marginRight: '6px' }} /> Export Report
          </button>
        </div>
      </div>

      {/* ── AI Assessment Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #001840, #002060)',
        borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white'
      }}>
        <Cpu size={20} color="var(--gov-saffron)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
            AI REVENUE INTELLIGENCE — FY {fiscalYear}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
            AI flagged 18 suspected under-assessments · ₹ 2.1 Cr potential revenue gap identified · 3 properties for field audit
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'AI CONFIDENCE', value: '91%' },
            { label: 'PROPERTIES SCANNED', value: '42,850' },
            { label: 'ANOMALIES', value: '18' },
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
          { id: 'overview', label: '📊 Overview' },
          { id: 'defaulters', label: '⚠️ Defaulter Engine' },
          { id: 'selfassess', label: '🤖 AI Audit' },
          { id: 'search', label: '🔍 Property Search' },
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
          { title: 'Total Demand (FY)', value: '₹ 14.5 Cr', sub: '↑ 12% vs last year', color: 'var(--gov-navy)', bg: 'bg-blue-light', icon: <FileText size={20} color="var(--gov-navy)" /> },
          { title: 'Collection Achieved', value: '₹ 9.8 Cr', sub: '67% of target', color: 'var(--gov-saffron)', bg: 'bg-orange-light', icon: <TrendingUp size={20} color="var(--gov-saffron)" />, pct: 67 },
          { title: 'Properties Assessed', value: '42,850', sub: '98.5% Coverage', color: 'var(--gov-green)', bg: 'bg-green-light', icon: <Building size={20} color="var(--gov-green)" /> },
          { title: 'Major Defaulters', value: '312', sub: '₹ 2.4 Cr pending', color: 'var(--gov-danger)', bg: 'bg-red-light', icon: <AlertCircle size={20} color="var(--gov-danger)" /> },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card" style={{ borderTopColor: card.color }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="stat-title">{card.title}</p>
                <h3 className="stat-value" style={{ color: card.color }}>{card.value}</h3>
              </div>
              <div className={`stat-icon-wrap ${card.bg}`}>{card.icon}</div>
            </div>
            {card.pct ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 700 }}>
                  <span className="text-muted">{card.sub}</span>
                  <span style={{ color: 'var(--gov-saffron)' }}>{card.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ width: `${card.pct}%`, height: '100%', background: card.color, borderRadius: '3px' }}></div>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: card.color }}>{card.sub}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="admin-chart-card col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="chart-title" style={{ margin: 0 }}>Zone-wise Revenue Breakdown (₹ Thousands)</h3>
              </div>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart data={taxData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="zone" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="residential" name="Residential" fill="var(--gov-navy)" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="commercial" name="Commercial" fill="var(--gov-saffron)" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="industrial" name="Industrial" fill="var(--gov-green)" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-chart-card">
              <h3 className="chart-title">Collection by Property Type</h3>
              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={propertyTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                      {propertyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                {propertyTypes.map((type, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx] }}></div>
                      <span style={{ color: 'var(--gov-text-muted)', fontWeight: 600 }}>{type.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--gov-navy)' }}>{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gov-cream)' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Recent Payments</h3>
                <span className="live-badge">LIVE</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="gov-table">
                  <thead><tr><th>Transaction</th><th>Owner</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentPayments.map((txn, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--gov-navy)' }}>{txn.id}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)' }}>{txn.date}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{txn.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gov-text-light)' }}>PID: {txn.property}</div>
                        </td>
                        <td style={{ fontWeight: 800 }}>{txn.amount}</td>
                        <td><span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gov-navy)', background: 'rgba(0,53,128,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{txn.method}</span></td>
                        <td>
                          {txn.status === 'Success' ?
                            <span className="badge badge-low"><CheckCircle size={12} style={{ marginRight: '4px' }}/>Success</span> :
                            <span className="badge badge-medium"><Clock size={12} style={{ marginRight: '4px' }}/>Pending</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-chart-card">
              <h3 className="chart-title">Monthly Collection vs Target (₹ Lakhs)</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <LineChart data={collectionTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    <Line type="monotone" dataKey="amount" name="Collected" stroke="var(--gov-navy)" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="var(--gov-saffron)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DEFAULTER ENGINE TAB ── */}
      {activeTab === 'defaulters' && (
        <div>
          <div style={{
            background: 'linear-gradient(90deg, #3d0000, #5d0000)',
            borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem', color: 'white'
          }}>
            <AlertOctagon size={18} color="#ff6b6b" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                AUTOMATED RECOVERY ENGINE — {defaulters.length} HIGH-VALUE CASES ACTIVE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                Total recoverable: ₹ 2.4 Cr · AI-generated notices ready · Legal escalation threshold: 90 days
              </div>
            </div>
            {selectedDefaulters.length > 0 && (
              <button onClick={sendBulkNotices} style={{
                background: noticesSent ? 'rgba(0,102,51,0.8)' : 'var(--gov-danger)', color: 'white',
                border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
              }}>
                {noticesSent ? '✓ Notices Sent!' : `📨 Send Notice to ${selectedDefaulters.length} Selected`}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['All', 'HIGH Risk', 'Legal Action', 'Notice Sent', 'Pending'].map(f => (
              <button key={f} style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid var(--gov-border)', background: f === 'All' ? 'var(--gov-navy)' : 'white', color: f === 'All' ? 'white' : 'var(--gov-text-muted)', cursor: 'pointer' }}>{f}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {defaulters.map((d, i) => (
              <div key={i} style={{
                background: 'white', border: `1px solid ${d.risk === 'HIGH' ? 'rgba(192,57,43,0.2)' : 'rgba(255,98,0,0.2)'}`,
                borderLeft: `4px solid ${d.risk === 'HIGH' ? 'var(--gov-danger)' : 'var(--gov-saffron)'}`,
                borderRadius: '8px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem'
              }}>
                <input type="checkbox" checked={selectedDefaulters.includes(d.id)} onChange={() => toggleDefaulter(d.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--gov-danger)' }}>{d.name}</span>
                    <span style={{ fontSize: '0.65rem', background: d.risk === 'HIGH' ? 'rgba(192,57,43,0.1)' : 'rgba(255,98,0,0.1)', color: d.risk === 'HIGH' ? 'var(--gov-danger)' : 'var(--gov-saffron)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>{d.risk} RISK</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>ID: {d.id} · Zone: {d.zone}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>Overdue: {d.due} · Status: <strong style={{ color: 'var(--gov-navy)' }}>{d.status}</strong></div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gov-danger)', fontFamily: 'var(--font-heading)' }}>{d.amount}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>PENDING DUES</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '6px 10px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} /> Notice
                  </button>
                  <button style={{ padding: '6px 10px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> Call
                  </button>
                  <button style={{ padding: '6px 10px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--gov-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                    ⚖️ Legal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI AUDIT TAB ── */}
      {activeTab === 'selfassess' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,53,128,0.05), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <Cpu size={18} color="#7c3aed" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#7c3aed', fontSize: '0.9rem' }}>AI SELF-ASSESSMENT AUDIT ENGINE</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', margin: 0 }}>
              AI compares citizen self-declared property values with satellite imagery, circle rates & market data. High variance cases flagged for physical audit.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Property Owner</th>
                  <th>Property Area</th>
                  <th>Self-Declared</th>
                  <th>AI Assessment</th>
                  <th>Variance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selfAssessments.map((sa, i) => (
                  <tr key={i} style={{ background: sa.flag ? 'rgba(192,57,43,0.02)' : 'white' }}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '0.82rem' }}>{sa.id}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)' }}>PID: {sa.pid}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{sa.name}</td>
                    <td>{sa.area}</td>
                    <td style={{ fontWeight: 700 }}>{sa.declared}</td>
                    <td style={{ fontWeight: 800, color: 'var(--gov-navy)' }}>{sa.ai_assessed}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: sa.flag ? 'var(--gov-danger)' : 'var(--gov-green)', fontSize: '0.85rem' }}>{sa.variance}</span>
                      {sa.flag && <div style={{ fontSize: '0.62rem', color: 'var(--gov-danger)', fontWeight: 700 }}>🚨 AUDIT REQUIRED</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {sa.flag ? (
                          <button style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(192,57,43,0.1)', color: 'var(--gov-danger)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '4px', cursor: 'pointer' }}>
                            📋 Field Audit
                          </button>
                        ) : (
                          <button style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', border: '1px solid rgba(0,102,51,0.2)', borderRadius: '4px', cursor: 'pointer' }}>
                            ✓ Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PROPERTY SEARCH TAB ── */}
      {activeTab === 'search' && (
        <div>
          {/* Search Box with Khapa MahaBhulekh Branding */}
          <div className="admin-chart-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'var(--gov-navy)', color: 'white', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                  <Building size={18} />
                </div>
                <div>
                  <h3 className="chart-title" style={{ margin: 0, fontSize: '1.05rem' }}>
                    खापा नगर परिषद & महाभूलेख (MahaBhulekh) — भूमी अभिलेख शोध
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--gov-text-muted)' }}>
                    गाव: खापा (Khapa) · तालुका: सावनेर (Saoner) · पिन कोड: <strong>441101</strong> · ७/१२ & मालमत्ता पत्रक
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, border: '1px solid rgba(0,102,51,0.2)' }}>
                🏛️ Official Khapa Portal Active
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '1rem' }}>
              खापा (441101) मधील खातेदाराचे नाव (उदा. <strong>राजेश ठाकरे / Rajesh Thakre</strong>) किंवा गट/सर्व्हे नंबर टाका — त्यांच्या नावावर असणारे सर्व <strong>घर, शेती, भूखंड (Plots) व व्यावसायिक गाळे</strong> थेट दिसतील.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                <input
                  value={ownerQuery}
                  onChange={e => setOwnerQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOwnerSearch()}
                  placeholder="उदा. राजेश ठाकरे / Rajesh Thakre, सुनीता देशमुख, संजय वंजारी..."
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1.5px solid var(--gov-border)', borderRadius: '8px',
                    fontSize: '0.9rem', fontFamily: 'var(--font-main)', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleOwnerSearch}
                disabled={ownerLoading || !ownerQuery.trim()}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', opacity: (!ownerQuery.trim() || ownerLoading) ? 0.6 : 1 }}
              >
                {ownerLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
                {ownerLoading ? 'शोधत आहे...' : 'शोधा (Search)'}
              </button>
              {searchedName && (
                <button onClick={clearSearch} style={{ padding: '0.75rem', border: '1px solid var(--gov-border)', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {/* Quick Name Chips for Khapa 441101 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>खापा खातेदार (Live Demo):</span>
              {[
                { en: 'Vaishali Dharmik', mr: 'वैशाली धार्मिक (घर + प्लॉट)' },
                { en: 'Parmanand Dharmik', mr: 'परमानंद धार्मिक (घर + १.५ एकर शेती)' },
                { en: 'Rajesh Thakre', mr: 'राजेश ठाकरे (3 Properties)' },
                { en: 'Sunita Deshmukh', mr: 'सुनीता देशमुख (शेती + घर)' },
                { en: 'Dipak Bawankule', mr: 'दीपक बावनकुळे (घर + शेती + प्लॉट)' },
                { en: 'Sachin Kohale', mr: 'सचिन कोहळे (कापड दुकान + घर)' },
                { en: 'Ashish Agrawal', mr: 'आशिष अग्रवाल (हार्डवेअर + गोदाम)' },
                { en: 'Nilesh Barapatre', mr: 'निलेश बारापात्रे (हातमाग)' },
                { en: 'Sanjay Wanjari', mr: 'संजय वंजारी (गोदाम + प्लॉट)' },
                { en: 'Pramod Kadu', mr: 'प्रमोद कडू (संत्रा बाग)' }
              ].map(item => (
                <button key={item.en} onClick={() => { setOwnerQuery(item.en); handleOwnerSearch(item.en); }}
                  style={{ padding: '4px 11px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '20px', border: '1px solid var(--gov-border)', background: ownerQuery === item.en ? 'var(--gov-navy)' : 'white', color: ownerQuery === item.en ? 'white' : 'var(--gov-navy)', cursor: 'pointer' }}>
                  {item.mr}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {ownerError && (
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1rem', color: 'var(--gov-danger)', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ {ownerError}
            </div>
          )}

          {/* Results */}
          {searchedName && !ownerLoading && !ownerError && (
            <>
              {/* Owner Summary Card */}
              {ownerResults.length > 0 ? (
                <>
                  <div style={{
                    background: 'linear-gradient(90deg, #001840, #002060)',
                    borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white'
                  }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={22} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                        {ownerResults[0].owner_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                        📞 {ownerResults[0].owner_phone || 'N/A'} &nbsp;·&nbsp; ✉️ {ownerResults[0].owner_email || 'N/A'}
                      </div>
                    </div>
                    {[
                      { label: 'TOTAL PROPERTIES', value: ownerResults.length },
                      { label: 'TOTAL TAX', value: fmtINR(ownerResults.reduce((s, p) => s + Number(p.annual_tax || 0), 0)) },
                      { label: 'TOTAL DUES', value: fmtINR(ownerResults.reduce((s, p) => s + Number(p.tax_due || 0), 0)) },
                    ].map((m, i) => (
                      <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1rem', borderRadius: '8px', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{m.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginTop: '2px' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Property Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {ownerResults.map((prop, idx) => {
                      const sc = statusColor(prop.payment_status);
                      return (
                        <div key={idx} style={{
                          background: 'white',
                          border: '1px solid var(--gov-border)',
                          borderLeft: `4px solid ${sc.color}`,
                          borderRadius: '10px', padding: '1.1rem 1.25rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                          transition: 'box-shadow 0.2s'
                        }}>
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <span style={{ color: sc.color }}>{typeIcon(prop.property_subtype)}</span>
                                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--gov-navy)' }}>
                                  {prop.property_subtype} — {prop.pid}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', fontWeight: 600 }}>
                                📋 {prop.survey_number || 'N/A'} &nbsp;·&nbsp; {prop.ward}
                              </div>
                            </div>
                            <span style={{
                              padding: '3px 9px', borderRadius: '5px', fontSize: '0.68rem',
                              fontWeight: 800, background: sc.bg, color: sc.color
                            }}>{prop.payment_status}</span>
                          </div>

                          {/* Address */}
                          <div style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', marginBottom: '0.75rem', display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                            <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            {prop.address}
                          </div>

                          {/* Details Grid with MahaBhulekh Gat & CTS Number */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {[
                              { label: 'प्रकार / Type', value: prop.property_type },
                              { label: 'क्षेत्रफळ (Area)', value: prop.area_hectare_aar || (prop.area_sqft ? `${prop.area_sqft} sqft` : '—') },
                              { label: 'गट / सर्व्हे क्र.', value: prop.survey_number || '—' },
                              { label: 'CTS / मालमत्ता', value: prop.cts_number || prop.pid },
                            ].map((d, i) => (
                              <div key={i} style={{ background: 'var(--gov-light-bg)', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.label}</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-navy)', marginTop: '1px' }}>{d.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Tax Row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: sc.bg, borderRadius: '7px', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>वार्षिक कर (Annual)</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--gov-navy)', fontFamily: 'var(--font-heading)' }}>{fmtINR(prop.annual_tax)}</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>बाकी (DUE)</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: sc.color, fontFamily: 'var(--font-heading)' }}>{fmtINR(prop.tax_due)}</div>
                            </div>
                          </div>

                          {/* MahaBhulekh Mutation & Assessment Badge */}
                          <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.67rem', fontWeight: 700 }}>
                            <span style={{ color: prop.assessment_status.includes('Verified') || prop.assessment_status.includes('प्रमाणित') ? 'var(--gov-green)' : 'var(--gov-saffron)' }}>
                              📜 {prop.assessment_status}
                            </span>
                            {prop.mutation_entry_no && (
                              <span style={{ color: 'var(--gov-text-muted)', fontSize: '0.65rem' }}>
                                {prop.mutation_entry_no}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '10px', border: '1px solid var(--gov-border)' }}>
                  <Search size={40} color="var(--gov-text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 700, color: 'var(--gov-text-muted)', fontSize: '1rem' }}>कोणतीही मालमत्ता सापडली नाही</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginTop: '0.35rem' }}>"<strong>{searchedName}</strong>" यांच्या नावावर खापा (441101) मध्ये नोंद उपलब्ध नाही.</div>
                </div>
              )}
            </>
          )}

          {/* Initial State */}
          {!searchedName && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '10px', border: '1px dashed var(--gov-border)', color: 'var(--gov-text-muted)' }}>
              <User size={44} style={{ opacity: 0.25, marginBottom: '1rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>Malik ka naam search karo</div>
              <div style={{ fontSize: '0.82rem' }}>Upar naam type karke Search dabao — us malik ki saari properties ek saath dikhegi</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxDashboard;
