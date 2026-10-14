import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  ShieldCheck, 
  Bell, 
  Database, 
  Globe, 
  Save, 
  RefreshCw, 
  CheckCircle2,
  Lock,
  KeyRound
} from 'lucide-react';
import '../../layouts/AdminLayout.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // System Settings State
  const [generalConfig, setGeneralConfig] = useState({
    councilName: 'Nagar Parishad Khapa',
    contactEmail: 'contact@khapacity.gov.in',
    helplineNumber: '+91 712 284 9200',
    taxRebatePercentage: 5,
    autoAssignGrievances: true
  });

  const [notificationConfig, setNotificationConfig] = useState({
    smsAlerts: true,
    emailNotifications: true,
    truckArrivalSMS: true,
    monthlyTaxReminders: true
  });

  const [roles] = useState([
    { id: 1, name: 'Chief Executive Officer', code: 'CEO_ADMIN', permissions: 'Full Access (Read/Write/Approve)' },
    { id: 2, name: 'Public Works Dept (PWD)', code: 'DEPT_PWD', permissions: 'Roads & Ward Mapping' },
    { id: 3, name: 'Sanitation Officer', code: 'DEPT_SANITATION', permissions: 'Garbage Trucks & Complaints' },
    { id: 4, name: 'Revenue Superintendent', code: 'DEPT_TAX', permissions: 'Property Tax & Water Bills' }
  ]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="settings-page p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <SettingsIcon className="text-indigo-600" size={28} /> System Settings & Controls
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure global portal parameters, user roles, notifications & data backup.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {saved ? 'Saved Successfully!' : 'Save Configurations'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          Settings updated successfully across portal servers.
        </div>
      )}

      {/* Settings Layout with Tabs */}
      <div className="grid grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="col-span-1 space-y-1">
          {[
            { id: 'general', label: 'General & City Info', icon: Globe },
            { id: 'roles', label: 'Roles & Access', icon: ShieldCheck },
            { id: 'notifications', label: 'Notification Rules', icon: Bell },
            { id: 'backup', label: 'Backup & Database', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">General Council Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Municipal Body Name</label>
                  <input 
                    type="text" 
                    value={generalConfig.councilName} 
                    onChange={e => setGeneralConfig({...generalConfig, councilName: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Official Support Email</label>
                  <input 
                    type="email" 
                    value={generalConfig.contactEmail} 
                    onChange={e => setGeneralConfig({...generalConfig, contactEmail: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Citizen Helpline Hotline</label>
                  <input 
                    type="text" 
                    value={generalConfig.helplineNumber} 
                    onChange={e => setGeneralConfig({...generalConfig, helplineNumber: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Early Property Tax Rebate (%)</label>
                  <input 
                    type="number" 
                    value={generalConfig.taxRebatePercentage} 
                    onChange={e => setGeneralConfig({...generalConfig, taxRebatePercentage: Number(e.target.value)})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Automatic Grievance Routing</div>
                  <div className="text-slate-500 text-xs">Route incoming citizen grievances directly to department heads based on category tags.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={generalConfig.autoAssignGrievances} 
                  onChange={e => setGeneralConfig({...generalConfig, autoAssignGrievances: e.target.checked})}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Roles */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Administrative User Roles</h2>
                <button className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
                  + Add New Role
                </button>
              </div>

              <div className="space-y-3">
                {roles.map((r) => (
                  <div key={r.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" /> {r.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Role Code: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{r.code}</code></div>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                      {r.permissions}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">Automated Alerts & Reminders</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'smsAlerts', label: 'SMS Alerts for Resolved Complaints', desc: 'Send direct SMS to citizens when their grievance is marked resolved.' },
                  { key: 'emailNotifications', label: 'Email Digest for Department Heads', desc: 'Send daily summary emails of open complaints & pending tasks.' },
                  { key: 'truckArrivalSMS', label: 'Live Garbage Truck Proximity Alerts', desc: 'Notify citizens when garbage vehicle is within 500m of their ward.' },
                  { key: 'monthlyTaxReminders', label: 'Property & Water Tax Payment Reminders', desc: 'Automated monthly notifications before due date.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{item.label}</div>
                      <div className="text-slate-500 text-xs">{item.desc}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationConfig[item.key]} 
                      onChange={e => setNotificationConfig({...notificationConfig, [item.key]: e.target.checked})}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">Database Backup & Maintenance</h2>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-3">
                <Database className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-bold">Automated Daily Backups Active</div>
                  <div className="text-xs text-amber-700 mt-0.5">Database snapshot taken daily at 02:00 AM IST. Backups retained for 90 days.</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => alert("Database snapshot download initiated.")}
                  className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Download Latest SQL Snapshot
                </button>
                <button 
                  onClick={() => alert("Cache cleared successfully.")}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Clear Application Cache
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
