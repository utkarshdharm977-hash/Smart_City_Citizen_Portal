import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/public/Home';
import About from './pages/public/About';
import CitizenServices from './pages/public/CitizenServices';
import DriverPortal from './pages/public/DriverPortal';
import Login from './pages/public/Login';

import Dashboard from './pages/admin/Dashboard';
import ComplaintsList from './pages/admin/ComplaintsList';
import Settings from './pages/admin/Settings';
import WaterDashboard from './pages/admin/WaterDashboard';
import TaxDashboard from './pages/admin/TaxDashboard';
import CertificatesDashboard from './pages/admin/CertificatesDashboard';
import GarbageDashboard from './pages/admin/GarbageDashboard';
import RouteBuilder from './pages/admin/RouteBuilder';
import WardMapping from './pages/admin/WardMapping';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<CitizenServices />} />
          <Route path="login" element={<Login />} />
          <Route path="driver" element={<DriverPortal />} />
          <Route path="driver/garbage" element={<DriverPortal />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="water" element={<WaterDashboard />} />
          <Route path="tax" element={<TaxDashboard />} />
          <Route path="certificates" element={<CertificatesDashboard />} />
          <Route path="route-builder" element={<RouteBuilder />} />
          <Route path="ward-mapping" element={<WardMapping />} />
          <Route path="garbage" element={<GarbageDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
