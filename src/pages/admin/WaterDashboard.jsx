import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Droplet, AlertTriangle, CheckCircle, Clock, MapPin, ExternalLink, 
  RefreshCw, Filter, Download, Zap, Thermometer, Activity, 
  AlertOctagon, TrendingDown, TrendingUp, BarChart2, Settings2,
  Radio, Gauge, Eye, BellOff, Bell
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend, RadialBarChart, RadialBar
} from 'recharts';

const usageData = [
  { day: 'Mon', usage: 4000, supply: 4200, leakage: 200, predicted: 4100 },
  { day: 'Tue', usage: 3200, supply: 3500, leakage: 300, predicted: 3400 },
  { day: 'Wed', usage: 5000, supply: 5200, leakage: 200, predicted: 5100 },
  { day: 'Thu', usage: 4500, supply: 4800, leakage: 300, predicted: 4700 },
  { day: 'Fri', usage: 6000, supply: 6500, leakage: 500, predicted: 6200 },
  { day: 'Sat', usage: 7200, supply: 7500, leakage: 300, predicted: 7300 },
  { day: 'Sun', usage: 6500, supply: 6800, leakage: 300, predicted: 6600 },
];

const pressureZones = [
  { zone: 'Ward 1-5', pressure: 85, status: 'Normal', color: '#006633' },
  { zone: 'Ward 6-10', pressure: 62, status: 'Low', color: '#FF6200' },
  { zone: 'Ward 11-15', pressure: 91, status: 'Normal', color: '#006633' },
  { zone: 'Ward 16-20', pressure: 34, status: 'Critical', color: '#C0392B' },
  { zone: 'Ward 21-25', pressure: 78, status: 'Normal', color: '#006633' },
];

const qualityReadings = [
  { time: '06:00', pH: 7.2, chlorine: 0.8, turbidity: 1.2 },
  { time: '09:00', pH: 7.1, chlorine: 0.75, turbidity: 1.4 },
  { time: '12:00', pH: 7.3, chlorine: 0.9, turbidity: 1.1 },
  { time: '15:00', pH: 7.0, chlorine: 0.7, turbidity: 1.5 },
  { time: '18:00', pH: 7.4, chlorine: 0.85, turbidity: 1.0 },
  { time: '21:00', pH: 7.2, chlorine: 0.8, turbidity: 1.2 },
];

const anomalies = [
  { id: 1, type: 'PIPE BURST', location: 'Near Shivaji Chowk, Ward 7', detected: '08:45 AM', probability: '87%', status: 'CRITICAL', action: 'Team Dispatched' },
  { id: 2, type: 'LOW PRESSURE', location: 'Nehru Nagar Zone B, Ward 16-20', detected: '10:12 AM', probability: '94%', status: 'CRITICAL', action: 'Under Investigation' },
  { id: 3, type: 'LEAKAGE', location: 'Main Pipeline Junction, Ward 3', detected: '11:30 AM', probability: '72%', status: 'WARNING', action: 'Inspector Assigned' },
];

const pumpStations = [
  { name: 'Pump Station Alpha', operational: true, flow: 92, lastMaintained: '3 days ago' },
  { name: 'Pump Station Beta', operational: true, flow: 88, lastMaintained: '7 days ago' },
  { name: 'Pump Station Gamma', operational: false, flow: 0, lastMaintained: '28 days ago' },
  { name: 'Pump Station Delta', operational: true, flow: 76, lastMaintained: '12 days ago' },
];

const WaterDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveFlow, setLiveFlow] = useState(92.4);
  const [showQualityAlert, setShowQualityAlert] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [qualityParam, setQualityParam] = useState('pH');

  const fetchWaterComplaints = async () => {
    setLoading(true);
    const { data } = await supabase.from('complaints').select('*').order('id', { ascending: false });
    if (data) {
      const waterOnly = data.filter(c => {
        const str = (c.department || c.category || '').toLowerCase();
        return str.includes('water') || str.includes('pipe') || str.includes('paani') || str.includes('leak');
      });
      setComplaints(waterOnly);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWaterComplaints();
    const sub = supabase.channel('water_complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchWaterComplaints())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  // Simulate live flow meter
  useEffect(() => {
    const t = setInterval(() => {
      setLiveFlow(prev => +(prev + (Math.random() - 0.5) * 0.8).toFixed(1));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const pendingCount = complaints.filter(c => c.status !== 'Resolved').length;
  const tabs = ['overview', 'quality', 'anomalies', 'pumps', 'dispatch'];

  return (
    <div className="dashboard-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Water Supply & Sanitation Control</h2>
          <p className="text-muted text-sm mt-1">AI-Powered Distribution Monitoring · Real-time Quality Testing · Leak Detection</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Live Flow Meter */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,53,128,0.1), rgba(0,102,51,0.05))',
            border: '1px solid rgba(0,53,128,0.2)', borderRadius: '10px', padding: '0.6rem 1.2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gov-navy)', fontFamily: 'var(--font-heading)' }}>
              {liveFlow} <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>MLD</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--gov-text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
              ⚡ LIVE FLOW RATE
            </div>
          </div>
          <div className="date-badge" style={{ color: 'var(--gov-navy)', backgroundColor: 'rgba(0,53,128,0.08)', borderColor: 'rgba(0,53,128,0.2)' }}>
            <span className="pulse-icon">🔵</span> Grid Status: Normal
          </div>
          <button onClick={fetchWaterComplaints} className="btn-outline-dark" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Download size={14} style={{ marginRight: '6px' }} /> Daily Log
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--gov-border)', width: 'fit-content' }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'quality', label: '🧪 Quality Lab' },
          { id: 'anomalies', label: '⚠️ AI Anomalies' },
          { id: 'pumps', label: '⚙️ Pump Stations' },
          { id: 'dispatch', label: '🚨 Field Dispatch' },
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
          { title: 'Active Connections', value: '12,450', sub: '+45 new this month', sub2: 'Coverage: 98.5%', color: 'var(--gov-navy)', bg: 'bg-blue-light', icon: <Droplet size={20} color="var(--gov-navy)" /> },
          { title: 'Monthly Revenue', value: '₹ 4.2L', sub: '92% collection rate', sub2: '↑ 8% vs last month', color: 'var(--gov-green)', bg: 'bg-green-light', icon: <CheckCircle size={20} color="var(--gov-green)" /> },
          { title: 'Open Complaints', value: pendingCount, sub: 'Field staff dispatched', sub2: `Avg resolution: 4.2h`, color: 'var(--gov-danger)', bg: 'bg-red-light', icon: <AlertTriangle size={20} color="var(--gov-danger)" /> },
          { title: 'Water Loss / Leakage', value: '4.2%', sub: '↓ 1.5% from last week', sub2: 'AI target: < 3%', color: 'var(--gov-saffron)', bg: 'bg-orange-light', icon: <TrendingDown size={20} color="var(--gov-saffron)" /> },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card" style={{ borderTopColor: card.color }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="stat-title">{card.title}</p>
                <h3 className="stat-value" style={{ color: card.color }}>{card.value}</h3>
              </div>
              <div className={`stat-icon-wrap ${card.bg}`}>{card.icon}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: card.color }}>{card.sub}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>{card.sub2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="admin-chart-card col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="chart-title" style={{ margin: 0 }}>Supply vs Consumption vs AI Forecast (KL)</h3>
              </div>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003580" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#003580" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006633" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#006633" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLeak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C0392B" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#C0392B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    <Area type="monotone" dataKey="supply" name="Total Supply" stroke="var(--gov-green)" fillOpacity={1} fill="url(#colorSupply)" strokeWidth={2} />
                    <Area type="monotone" dataKey="usage" name="Consumption" stroke="var(--gov-navy)" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={2} />
                    <Area type="monotone" dataKey="leakage" name="Leakage Loss" stroke="var(--gov-danger)" fillOpacity={1} fill="url(#colorLeak)" strokeWidth={2} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pressure Zone Map */}
            <div className="admin-chart-card">
              <h3 className="chart-title">Zone Pressure Monitor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {pressureZones.map((zone, i) => (
                  <div key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedZone(zone)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{zone.zone}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: zone.color, background: `${zone.color}15`, padding: '2px 8px', borderRadius: '4px' }}>
                        {zone.status} — {zone.pressure} PSI
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '4px' }}>
                      <div style={{ width: `${zone.pressure}%`, height: '100%', background: zone.color, borderRadius: '4px', transition: 'width 1s' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', fontSize: '0.8rem' }}>
                🗺️ Open Pressure Heat Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUALITY LAB TAB ── */}
      {activeTab === 'quality' && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="admin-chart-card col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="chart-title" style={{ margin: 0 }}>Real-Time Water Quality Monitoring</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['pH', 'chlorine', 'turbidity'].map(p => (
                  <button key={p} onClick={() => setQualityParam(p)} style={{
                    padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
                    background: qualityParam === p ? 'var(--gov-navy)' : 'var(--gov-light-bg)',
                    color: qualityParam === p ? 'white' : 'var(--gov-text-muted)',
                    border: '1px solid var(--gov-border)', borderRadius: '4px', cursor: 'pointer'
                  }}>{p.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <LineChart data={qualityReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <Line type="monotone" dataKey={qualityParam} stroke="var(--gov-navy)" strokeWidth={3} dot={{ r: 5, fill: 'var(--gov-navy)' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-chart-card">
            <h3 className="chart-title">WHO Compliance Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { param: 'pH Level', value: '7.2', safe: '6.5–8.5', status: 'SAFE', pct: 88 },
                { param: 'Chlorine', value: '0.8 mg/L', safe: '0.2–1.0', status: 'SAFE', pct: 80 },
                { param: 'Turbidity', value: '1.2 NTU', safe: '< 5', status: 'SAFE', pct: 76 },
                { param: 'Total TDS', value: '285 mg/L', safe: '< 500', status: 'SAFE', pct: 57 },
                { param: 'E.Coli', value: '0 CFU/100ml', safe: '0', status: 'SAFE', pct: 100 },
              ].map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.param}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gov-text-muted)' }}>{p.value}</span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', padding: '1px 6px', borderRadius: '3px', fontWeight: 800 }}>{p.status}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                    <div style={{ width: `${p.pct}%`, height: '100%', background: 'var(--gov-green)', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gov-text-muted)', marginTop: '2px' }}>Safe Range: {p.safe}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI ANOMALIES TAB ── */}
      {activeTab === 'anomalies' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(90deg, #1a0000, #3d0000)',
            borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem', color: 'white'
          }}>
            <AlertOctagon size={20} color="#ff6b6b" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                AI ANOMALY DETECTION ENGINE — {anomalies.length} ACTIVE ALERTS
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                ML Model: Leak Detector v2.1 · Last scan: 2 minutes ago · Confidence threshold: 70%+
              </div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#ff6b6b', fontWeight: 700 }}>● SCANNING</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {anomalies.map((a, i) => (
              <div key={a.id} style={{
                background: 'white', border: `1px solid ${a.status === 'CRITICAL' ? 'rgba(192,57,43,0.3)' : 'rgba(255,98,0,0.3)'}`,
                borderLeft: `4px solid ${a.status === 'CRITICAL' ? 'var(--gov-danger)' : 'var(--gov-saffron)'}`,
                borderRadius: '8px', padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '2rem' }}>{a.status === 'CRITICAL' ? '🚨' : '⚠️'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: a.status === 'CRITICAL' ? 'var(--gov-danger)' : 'var(--gov-saffron)' }}>
                      {a.type}
                    </span>
                    <span style={{ fontSize: '0.65rem', background: a.status === 'CRITICAL' ? 'rgba(192,57,43,0.1)' : 'rgba(255,98,0,0.1)', color: a.status === 'CRITICAL' ? 'var(--gov-danger)' : 'var(--gov-saffron)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      {a.status}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)' }}>Detected: {a.detected}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--gov-text)' }}>
                    <MapPin size={13} color="var(--gov-danger)" />
                    {a.location}
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gov-danger)', fontFamily: 'var(--font-heading)' }}>{a.probability}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>AI PROBABILITY</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', whiteSpace: 'nowrap', background: a.status === 'CRITICAL' ? 'var(--gov-danger)' : 'var(--gov-saffron)', borderColor: a.status === 'CRITICAL' ? 'var(--gov-danger)' : 'var(--gov-saffron)' }}>
                    🚒 Dispatch Team
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gov-green)', fontWeight: 700, textAlign: 'center' }}>✓ {a.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PUMP STATIONS TAB ── */}
      {activeTab === 'pumps' && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {pumpStations.map((pump, i) => (
            <div key={i} style={{
              background: 'white', border: `1px solid ${pump.operational ? 'rgba(0,102,51,0.2)' : 'rgba(192,57,43,0.3)'}`,
              borderTop: `4px solid ${pump.operational ? 'var(--gov-green)' : 'var(--gov-danger)'}`,
              borderRadius: '10px', padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0 }}>⚙️ {pump.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', margin: '4px 0 0' }}>Last maintained: {pump.lastMaintained}</p>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px',
                  background: pump.operational ? 'rgba(0,102,51,0.1)' : 'rgba(192,57,43,0.1)',
                  color: pump.operational ? 'var(--gov-green)' : 'var(--gov-danger)'
                }}>
                  {pump.operational ? '● ONLINE' : '● OFFLINE'}
                </span>
              </div>
              {pump.operational ? (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontWeight: 700 }}>
                      <span>Flow Efficiency</span>
                      <span style={{ color: pump.flow > 85 ? 'var(--gov-green)' : 'var(--gov-saffron)' }}>{pump.flow}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                      <div style={{ width: `${pump.flow}%`, height: '100%', background: pump.flow > 85 ? 'var(--gov-green)' : 'var(--gov-saffron)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-light-bg)', cursor: 'pointer' }}>
                      📊 View Analytics
                    </button>
                    <button style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(192,57,43,0.3)', borderRadius: '6px', background: 'rgba(192,57,43,0.05)', color: 'var(--gov-danger)', cursor: 'pointer' }}>
                      🔴 Emergency Stop
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ background: 'rgba(192,57,43,0.05)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gov-danger)', fontWeight: 700 }}>Station OFFLINE — Maintenance Required</p>
                  <button className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', fontSize: '0.78rem', background: 'var(--gov-danger)', borderColor: 'var(--gov-danger)' }}>
                    🔧 Schedule Repair
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── FIELD DISPATCH TAB ── */}
      {activeTab === 'dispatch' && (
        <div className="admin-activity-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gov-light-bg)' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Field Dispatch Log</h3>
            <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Assign Inspector</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Evidence</th>
                  <th>Issue Details</th>
                  <th>Location</th>
                  <th>Assigned Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading logs...</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No active field dispatches.</td></tr>
                ) : complaints.map((c) => {
                  const lat = c.latitude || 21.296;
                  const lng = c.longitude || 79.072;
                  return (
                    <tr key={c.id}>
                      <td>
                        {c.image_url ? (
                          <img src={c.image_url} alt="Issue" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--gov-border)' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--gov-light-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--gov-text-muted)' }}>No Img</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gov-navy)' }}>{c.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || 'Water issue reported'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{lat.toFixed(4)}, {lng.toFixed(4)}</div>
                        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--gov-saffron)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          Open Maps <ExternalLink size={10} />
                        </a>
                      </td>
                      <td><span style={{ fontSize: '0.78rem', color: 'var(--gov-navy)', fontWeight: 700 }}>{c.assigned_officer || 'Suresh Patil'}</span></td>
                      <td><span style={{ fontSize: '0.72rem', fontWeight: 800, color: c.priority === 'High' ? 'var(--gov-danger)' : 'var(--gov-saffron)' }}>{c.priority || 'Medium'}</span></td>
                      <td><span className={`badge ${c.status === 'Resolved' ? 'badge-low' : 'badge-high'}`}>{c.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,102,51,0.1)', color: 'var(--gov-green)', border: '1px solid rgba(0,102,51,0.2)', borderRadius: '4px', cursor: 'pointer' }}>✓ Resolve</button>
                          <button style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)', borderRadius: '4px', cursor: 'pointer' }}>👁 View</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterDashboard;
