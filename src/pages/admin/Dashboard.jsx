import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, FileText, AlertTriangle, CheckCircle, TrendingUp,
  Activity, Download, Filter, ArrowRight, Cpu, Zap,
  Shield, Bell, Radio, BarChart2, Globe, Clock,
  ThumbsUp, AlertOctagon, Layers, ChevronRight, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, RadialBarChart, RadialBar
} from 'recharts';

const complaintData = [
  { day: 'Mon', received: 45, resolved: 30, predicted: 48 },
  { day: 'Tue', received: 52, resolved: 48, predicted: 55 },
  { day: 'Wed', received: 38, resolved: 42, predicted: 41 },
  { day: 'Thu', received: 65, resolved: 55, predicted: 60 },
  { day: 'Fri', received: 48, resolved: 60, predicted: 52 },
  { day: 'Sat', received: 25, resolved: 35, predicted: 28 },
  { day: 'Sun', received: 20, resolved: 28, predicted: 22 },
];

const revenueData = [
  { month: 'Apr', taxes: 4000, water: 2400, garbage: 1200, certificates: 800 },
  { month: 'May', taxes: 3000, water: 1398, garbage: 1100, certificates: 900 },
  { month: 'Jun', taxes: 2000, water: 9800, garbage: 1500, certificates: 1200 },
  { month: 'Jul', taxes: 2780, water: 3908, garbage: 1300, certificates: 1100 },
  { month: 'Aug', taxes: 1890, water: 4800, garbage: 1400, certificates: 950 },
  { month: 'Sep', taxes: 2390, water: 3800, garbage: 1600, certificates: 1300 },
];

const deptHealthData = [
  { dept: 'Water', efficiency: 88, complaints: 12, staff: 95, budget: 72 },
  { dept: 'Tax', efficiency: 92, complaints: 8, staff: 88, budget: 85 },
  { dept: 'Garbage', efficiency: 78, complaints: 22, staff: 91, budget: 65 },
  { dept: 'Certs', efficiency: 96, complaints: 4, staff: 98, budget: 90 },
];

const radarData = [
  { metric: 'Water', value: 88 },
  { metric: 'Tax', value: 92 },
  { metric: 'Garbage', value: 78 },
  { metric: 'Complaints', value: 85 },
  { metric: 'Certs', value: 96 },
  { metric: 'Roads', value: 71 },
];

const aiAlerts = [
  { id: 1, severity: 'critical', msg: 'AI Detected: Water pressure anomaly in Ward 7 — Pipe burst probability 87%', time: '2m ago', icon: '🔴' },
  { id: 2, severity: 'warning', msg: 'ML Forecast: Tax defaulter count expected to rise 23% next week', time: '18m ago', icon: '🟡' },
  { id: 3, severity: 'info', msg: 'Pattern Match: Garbage overload detected near Central Market Zone', time: '45m ago', icon: '🔵' },
  { id: 4, severity: 'critical', msg: 'Anomaly: 48 complaints from Ward 12 in last 2 hours — Flood risk high', time: '1h ago', icon: '🔴' },
];

const liveActivity = [
  { id: 1, type: 'payment', text: 'Rajesh Kumar paid ₹2,450 for Property Tax', time: '2m ago', color: 'var(--gov-saffron)' },
  { id: 2, type: 'complaint', text: 'New Grievance #8493 logged — Water Supply Ward 7', time: '15m ago', color: 'var(--gov-danger)' },
  { id: 3, type: 'cert', text: 'Birth Certificate approved for Amit Singh', time: '1h ago', color: 'var(--gov-green)' },
  { id: 4, type: 'payment', text: 'Water Bill ₹850 received — Connection #WC-4920', time: '2h ago', color: 'var(--gov-navy)' },
  { id: 5, type: 'resolved', text: 'Grievance #8480 (Street Light) resolved by Deepak', time: '3h ago', color: 'var(--gov-green)' },
];

const deptStatus = [
  { name: 'Water & Sanitation', status: 'Operational', health: 88, color: '#003580', icon: '💧', trend: '+2%' },
  { name: 'Property Tax', status: 'Operational', health: 92, color: '#006633', icon: '🏛️', trend: '+5%' },
  { name: 'Garbage Collection', status: 'High Load', health: 78, color: '#FF6200', icon: '🚛', trend: '-3%' },
  { name: 'Civil Certificates', status: 'Operational', health: 96, color: '#003580', icon: '📜', trend: '+8%' },
  { name: 'Public Grievances', status: 'Moderate', health: 85, color: '#C8960C', icon: '📋', trend: '+1%' },
];

const COLORS = ['#003580', '#FF6200', '#006633', '#C8960C', '#C0392B'];

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [aiScore, setAiScore] = useState(87);
  const [liveItems, setLiveItems] = useState(liveActivity);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate AI score fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setAiScore(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(80, Math.min(99, prev + delta));
      });
      setTicker(p => p + 1);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const sendBroadcast = () => {
    if (broadcastMsg.trim()) {
      alert(`📣 Emergency Broadcast Sent!\n\n"${broadcastMsg}"\n\nDelivered to: 340 field personnel, 12,450 citizens (SMS), all department heads.`);
      setBroadcastMsg('');
      setShowBroadcast(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>

      {/* ── AI Command Ticker ── */}
      <div style={{
        background: 'linear-gradient(90deg, #001840 0%, #003580 50%, #001840 100%)',
        color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
        fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
        overflow: 'hidden', position: 'relative'
      }}>
        <span style={{ background: 'var(--gov-saffron)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', flexShrink: 0 }}>
          🤖 AI MONITOR
        </span>
        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span style={{ 
            display: 'inline-block', color: '#93c5fd',
            animation: 'ticker-scroll 30s linear infinite'
          }}>
            🔴 ALERT: Pipe burst probability 87% in Ward 7 &nbsp;&nbsp;|&nbsp;&nbsp; 🟡 Tax collection target: 67% achieved — 23 days left &nbsp;&nbsp;|&nbsp;&nbsp; 🟢 All servers operational &nbsp;&nbsp;|&nbsp;&nbsp; 🔵 Monsoon risk analysis: 3 low-lying wards flagged &nbsp;&nbsp;|&nbsp;&nbsp; 📊 Today's collection: ₹4.8L revenue processed &nbsp;&nbsp;|&nbsp;&nbsp; 🚛 12/15 garbage trucks reporting on schedule
          </span>
        </div>
        <span style={{ color: '#86efac', flexShrink: 0, fontSize: '0.72rem' }}>
          ● LIVE — {time.toLocaleTimeString('en-IN')}
        </span>
      </div>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Municipal Command Center</h2>
          <p className="text-muted text-sm mt-1">AI-powered real-time oversight of all city operations</p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{
            background: `linear-gradient(135deg, rgba(0,53,128,0.1), rgba(0,102,51,0.1))`,
            border: '1px solid rgba(0,53,128,0.2)', borderRadius: '8px',
            padding: '0.5rem 1rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gov-navy)', fontFamily: 'var(--font-heading)' }}>
              {aiScore}%
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--gov-text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
              AI CITY SCORE
            </div>
          </div>
          <button 
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gov-danger)', borderColor: 'var(--gov-danger)' }}
          >
            <Radio size={14} /> Emergency Broadcast
          </button>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export Master Report
          </button>
        </div>
      </div>

      {/* ── Emergency Broadcast Panel ── */}
      {showBroadcast && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF5F5, #FFF0F0)',
          border: '2px solid var(--gov-danger)', borderRadius: '10px',
          padding: '1.5rem', marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(192,57,43,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertOctagon size={20} color="var(--gov-danger)" />
            <h3 style={{ color: 'var(--gov-danger)', fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              EMERGENCY BROADCAST SYSTEM
            </h3>
            <span style={{ fontSize: '0.7rem', background: 'var(--gov-danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              REACHES 12,450+ CITIZENS
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <textarea
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Type emergency alert message... (will be sent via SMS, App Push & PA System)"
              rows={2}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '6px',
                border: '1px solid var(--gov-border)', fontFamily: 'var(--font-main)',
                fontSize: '0.9rem', resize: 'none', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={sendBroadcast} className="btn btn-primary" style={{ background: 'var(--gov-danger)', borderColor: 'var(--gov-danger)', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                📣 BROADCAST NOW
              </button>
              <button onClick={() => setShowBroadcast(false)} className="btn-outline-dark" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textAlign: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Grievances', value: '1,245', sub: '+12% this week', sub2: 'Active tracking', color: 'var(--gov-danger)', bg: 'bg-red-light', icon: <AlertTriangle size={20} color="var(--gov-danger)" />, trend: 'up' },
          { title: 'Resolution Rate', value: '85%', sub: '982 / 1,245 closed', sub2: '↑ 5% vs last week', color: 'var(--gov-green)', bg: 'bg-green-light', icon: <CheckCircle size={20} color="var(--gov-green)" />, trend: 'up' },
          { title: 'Field Personnel', value: '340', sub: '12 teams deployed', sub2: '98% on-duty today', color: 'var(--gov-navy)', bg: 'bg-blue-light', icon: <Users size={20} color="var(--gov-navy)" />, trend: 'stable' },
          { title: 'Pending Approvals', value: '156', sub: 'Across departments', sub2: 'SLA breach risk: 23', color: 'var(--gov-saffron)', bg: 'bg-orange-light', icon: <FileText size={20} color="var(--gov-saffron)" />, trend: 'down' },
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

      {/* ── AI Intelligence Alerts ── */}
      <div style={{
        background: 'white', borderRadius: '10px', border: '1px solid var(--gov-border)',
        marginBottom: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #001840, #002060)',
          padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cpu size={16} color="var(--gov-saffron)" />
            <span style={{ color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              AI THREAT INTELLIGENCE & PREDICTIVE ALERTS
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 700 }}>● LIVE ML MODEL v3.2</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
          {aiAlerts.map((alert, i) => (
            <div key={alert.id} style={{
              padding: '1rem 1.5rem',
              borderRight: i % 2 === 0 ? '1px solid var(--gov-border)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--gov-border)' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              background: alert.severity === 'critical' ? 'rgba(192,57,43,0.03)' : 'white',
              transition: 'background 0.2s'
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>{alert.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--gov-text)', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                  {alert.msg}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>{alert.time}</span>
              </div>
              <button style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                background: alert.severity === 'critical' ? 'rgba(192,57,43,0.1)' : 'rgba(0,53,128,0.08)',
                color: alert.severity === 'critical' ? 'var(--gov-danger)' : 'var(--gov-navy)',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                Take Action →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="admin-chart-card col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="chart-title" style={{ margin: 0 }}>Grievance Resolution + AI Forecast</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['7D', '1M', '3M', 'YTD'].map(t => (
                <button key={t} style={{
                  padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700,
                  background: t === '7D' ? 'var(--gov-navy)' : 'var(--gov-light-bg)',
                  color: t === '7D' ? 'white' : 'var(--gov-text-muted)',
                  border: '1px solid var(--gov-border)', borderRadius: '4px', cursor: 'pointer'
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={complaintData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gov-danger)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--gov-danger)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gov-green)" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="var(--gov-green)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="received" name="Logged" stroke="var(--gov-danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorReceived)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="var(--gov-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                <Area type="monotone" dataKey="predicted" name="AI Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 3" fillOpacity={1} fill="url(#colorPred)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="admin-activity-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gov-cream)' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Live Civic Feed</h3>
            <span className="live-badge">LIVE</span>
          </div>
          <div className="activity-feed" style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
            {liveItems.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }}></div>
                <div className="activity-content">
                  <p className="activity-text" style={{ fontWeight: 600 }}>{item.text}</p>
                  <p className="activity-time" style={{ fontWeight: 700 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--gov-border)', background: 'var(--gov-light-bg)' }}>
            <button className="btn-text">View Full System Log <ArrowRight size={14} style={{ marginLeft: '4px' }}/></button>
          </div>
        </div>
      </div>

      {/* ── Department Health Matrix ── */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Radar */}
        <div className="admin-chart-card">
          <h3 className="chart-title">Department Performance Radar</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--gov-border)" />
                <PolarAngleAxis dataKey="metric" fontSize={11} fontWeight={700} />
                <Radar name="Efficiency %" dataKey="value" stroke="var(--gov-navy)" fill="var(--gov-navy)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Status Grid */}
        <div className="admin-chart-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="chart-title" style={{ margin: 0 }}>Department Live Status</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>Auto-refresh: 30s</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {deptStatus.map((dept, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{dept.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-text)' }}>{dept.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: dept.status === 'High Load' ? 'var(--gov-saffron)' : 'var(--gov-green)' }}>
                        {dept.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gov-navy)' }}>{dept.health}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                    <div style={{
                      width: `${dept.health}%`, height: '100%', borderRadius: '3px',
                      background: dept.health > 90 ? 'var(--gov-green)' : dept.health > 80 ? 'var(--gov-navy)' : 'var(--gov-saffron)',
                      transition: 'width 1s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Revenue + Quick Actions ── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="admin-chart-card col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="chart-title" style={{ margin: 0 }}>Multi-Department Revenue (₹ Thousands)</h3>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Bar dataKey="taxes" name="Property Tax" fill="var(--gov-navy)" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="water" name="Water Bills" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="garbage" name="Garbage Cess" fill="var(--gov-saffron)" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="certificates" name="Cert Fees" fill="var(--gov-green)" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions + System Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-stat-card" style={{ padding: '1.5rem', minHeight: 'auto' }}>
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Quick Command Center</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {[
                { label: '📣 Announce Alert', style: { background: 'rgba(192,57,43,0.08)', color: 'var(--gov-danger)', border: '1px solid rgba(192,57,43,0.2)' } },
                { label: '👥 Deploy Staff', style: { background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)' } },
                { label: '📑 Tax Notices', style: { background: 'rgba(255,98,0,0.08)', color: 'var(--gov-saffron)', border: '1px solid rgba(255,98,0,0.2)' } },
                { label: '📊 Analytics', style: { background: 'rgba(0,102,51,0.08)', color: 'var(--gov-green)', border: '1px solid rgba(0,102,51,0.2)' } },
                { label: '🚛 Dispatch Truck', style: { background: 'rgba(200,150,12,0.08)', color: 'var(--gov-gold)', border: '1px solid rgba(200,150,12,0.2)' } },
                { label: '📋 Review SLAs', style: { background: 'rgba(0,53,128,0.08)', color: 'var(--gov-navy)', border: '1px solid rgba(0,53,128,0.2)' } },
              ].map((btn, i) => (
                <button key={i} style={{ padding: '0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', ...btn.style }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-stat-card" style={{ padding: '1.5rem', flex: 1, minHeight: 'auto' }}>
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Infrastructure Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { name: 'Citizen Portal', pct: 100, status: '99.9% Uptime', ok: true },
                { name: 'Payment Gateway', pct: 100, status: 'Operational', ok: true },
                { name: 'GPS Tracking', pct: 85, status: 'High Latency', ok: false },
                { name: 'AI Engine', pct: 97, status: 'Running v3.2', ok: true },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px', fontWeight: 700 }}>
                    <span>{s.name}</span>
                    <span style={{ color: s.ok ? 'var(--gov-green)' : 'var(--gov-saffron)' }}>{s.status}</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.ok ? 'var(--gov-green)' : 'var(--gov-saffron)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
