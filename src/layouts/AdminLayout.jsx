import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  Map, 
  Droplet, 
  FileText, 
  Settings,
  LogOut,
  Bell,
  Truck,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Shield,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import './AdminLayout.css';

const DEPARTMENT_ROLES = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Super Admin (Chief Officer)',
    officer: 'Rajesh Deshmukh',
    title: 'Chief Executive Officer',
    avatar: 'CO',
    color: '#0F4C81',
    defaultPath: '/admin',
    allowedPaths: ['/admin', '/admin/tax', '/admin/water', '/admin/certificates', '/admin/complaints', '/admin/employees', '/admin/route-builder', '/admin/ward-mapping', '/admin/garbage', '/admin/assets', '/admin/settings']
  },
  TAX_ADMIN: {
    id: 'TAX_ADMIN',
    name: 'Property Tax Admin',
    officer: 'V. Sharma',
    title: 'Tax Superintendent',
    avatar: 'TS',
    color: '#0ea5e9',
    defaultPath: '/admin/tax',
    allowedPaths: ['/admin/tax', '/admin/settings']
  },
  WATER_ADMIN: {
    id: 'WATER_ADMIN',
    name: 'Water Supply Admin',
    officer: 'Er. A. Kulkarni',
    title: 'Executive Water Engineer',
    avatar: 'WE',
    color: '#eab308',
    defaultPath: '/admin/water',
    allowedPaths: ['/admin/water', '/admin/settings']
  },
  GRIEVANCE_ADMIN: {
    id: 'GRIEVANCE_ADMIN',
    name: 'Grievances Nodal Admin',
    officer: 'Mrs. S. Patil',
    title: 'Civic Grievance Officer',
    avatar: 'GO',
    color: '#ef4444',
    defaultPath: '/admin/complaints',
    allowedPaths: ['/admin/complaints', '/admin/settings']
  },
  CERTIFICATE_ADMIN: {
    id: 'CERTIFICATE_ADMIN',
    name: 'Certificates Admin',
    officer: 'Dr. R. Gupta',
    title: 'Registrar of Births & Deaths',
    avatar: 'RC',
    color: '#10b981',
    defaultPath: '/admin/certificates',
    allowedPaths: ['/admin/certificates', '/admin/settings']
  },
  GARBAGE_ADMIN: {
    id: 'GARBAGE_ADMIN',
    name: 'Garbage & Sanitation Admin',
    officer: 'K. Verma',
    title: 'Swachhata Sanitation Officer',
    avatar: 'SO',
    color: '#8b5cf6',
    defaultPath: '/admin/garbage',
    allowedPaths: ['/admin/garbage', '/admin/route-builder', '/admin/ward-mapping', '/admin/settings']
  }
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Read role from localStorage or default based on current path
  const [currentRoleKey, setCurrentRoleKey] = useState(() => {
    const saved = localStorage.getItem('activeDepartmentRole');
    if (saved && DEPARTMENT_ROLES[saved]) return saved;
    
    // Auto detect from path
    if (location.pathname === '/admin/tax') return 'TAX_ADMIN';
    if (location.pathname === '/admin/water') return 'WATER_ADMIN';
    if (location.pathname === '/admin/certificates') return 'CERTIFICATE_ADMIN';
    if (location.pathname === '/admin/complaints') return 'GRIEVANCE_ADMIN';
    if (location.pathname === '/admin/garbage') return 'GARBAGE_ADMIN';
    return 'SUPER_ADMIN';
  });

  const activeRole = DEPARTMENT_ROLES[currentRoleKey] || DEPARTMENT_ROLES.SUPER_ADMIN;

  const allNavItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/tax', label: 'Property Tax', icon: <Briefcase size={20} /> },
    { path: '/admin/water', label: 'Water Supply', icon: <Droplet size={20} /> },
    { path: '/admin/certificates', label: 'Certificates', icon: <FileText size={20} /> },
    { path: '/admin/complaints', label: 'Grievances', icon: <AlertTriangle size={20} /> },
    { path: '/admin/employees', label: 'Employees', icon: <Users size={20} /> },
    { path: '/admin/route-builder', label: 'Route Builder', icon: <Map size={20} /> },
    { path: '/admin/ward-mapping', label: 'Ward Mapping', icon: <Map size={20} /> },
    { path: '/admin/garbage', label: 'Garbage Tracking', icon: <Truck size={20} /> },
    { path: '/admin/assets', label: 'Assets & Waste', icon: <Map size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // Filter sidebar navigation items strictly by active department admin role!
  const navItems = allNavItems.filter(item => activeRole.allowedPaths.includes(item.path));

  const handleRoleChange = (roleKey) => {
    setCurrentRoleKey(roleKey);
    localStorage.setItem('activeDepartmentRole', roleKey);
    setIsRoleDropdownOpen(false);
    
    // Navigate to default path for that role
    const targetRole = DEPARTMENT_ROLES[roleKey];
    if (targetRole && targetRole.defaultPath) {
      navigate(targetRole.defaultPath);
    }
  };

  const currentNav = allNavItems.find(item => location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin')) || allNavItems[0];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      {!focusMode && (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ width: isCollapsed ? '72px' : '280px', transition: 'all 0.3s ease' }}>
          <div className="sidebar-brand flex justify-between items-center" style={{ borderBottom: `2px solid ${activeRole.color}` }}>
            {!isCollapsed && (
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>NP Admin</h2>
                <span style={{ fontSize: '0.72rem', color: activeRole.color, fontWeight: 700, textTransform: 'uppercase' }}>
                  {activeRole.id === 'SUPER_ADMIN' ? 'Full ERP System' : `${activeRole.name}`}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                title={isCollapsed ? item.label : ''}
                className={`nav-item ${location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin') ? 'active' : ''}`}
                style={isCollapsed ? { justifyContent: 'center', padding: '0.75rem 0' } : {}}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link to="/" className="nav-item" style={isCollapsed ? { justifyContent: 'center', padding: '0.75rem 0' } : {}}>
              <LogOut size={20} />
              {!isCollapsed && <span>Public Portal</span>}
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFocusMode(!focusMode)} 
              className="btn btn-outline-dark text-xs flex items-center gap-1"
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
              title="Toggle full screen focus for current department"
            >
              <Maximize2 size={14} />
              <span>{focusMode ? 'Show Sidebar' : 'Department Focus View'}</span>
            </button>

            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Active Module: {currentNav.label}
            </span>
          </div>

          {/* Department Role Switcher Dropdown */}
          <div className="header-actions relative">
            <div className="relative">
              <button 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: '#f8fafc',
                  border: `1.5px solid ${activeRole.color}`,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <Shield size={16} color={activeRole.color} />
                <div className="text-left">
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem', lineHeight: 1.1 }}>
                    {activeRole.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {activeRole.officer} ({activeRole.title})
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '320px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    padding: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                    Switch Department Admin Portal
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Object.values(DEPARTMENT_ROLES).map((role) => (
                      <div
                        key={role.id}
                        onClick={() => handleRoleChange(role.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: currentRoleKey === role.id ? '#f1f5f9' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '2px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentRoleKey === role.id ? '#f1f5f9' : 'transparent'}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                            {role.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Officer: {role.officer}
                          </div>
                        </div>
                        {currentRoleKey === role.id && <UserCheck size={16} color={role.color} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge-indicator"></span>
            </button>

            <div className="admin-profile">
              <div className="avatar" style={{ backgroundColor: activeRole.color }}>{activeRole.avatar}</div>
              <div className="text-left" style={{ lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>{activeRole.officer}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{activeRole.title}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
