import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Phone, Mail, Globe, Shield } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import AccessibilityWidget from '../components/AccessibilityWidget';
import './PublicLayout.css';

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="public-layout">

      {/* ── Top Government Info Bar ── */}
      <div className="gov-top-bar">
        <div className="container gov-top-bar-inner">
          <div className="gov-top-bar-left">
            <div className="gov-top-bar-india">
              <span className="gov-top-bar-emblem">🇮🇳</span>
              <span>Government of Maharashtra</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>
              नगर परिषद खापा — Official Digital Portal
            </span>
          </div>
          <div className="gov-top-bar-right">
            <a href="tel:18001234567" className="gov-top-bar-link">
              <Phone size={11} /> 1800-123-4567 (Toll Free)
            </a>
            <a href="mailto:support@nagarparishad.gov.in" className="gov-top-bar-link">
              <Mail size={11} /> support@nagarparishad.gov.in
            </a>
            <a href="#" className="gov-top-bar-link">
              <Globe size={11} /> हिंदी | मराठी
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className={`gov-header ${scrolled ? 'scrolled' : ''} ${isHomePage && !scrolled ? 'transparent' : ''}`}>
        <div className="container header-inner">

          <Link to="/" className="brand">
            <div className="logo-icon">
              <span className="logo-emblem">🏛️</span>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Nagar Parishad Khapa</h1>
              <span className="brand-subtitle">Smart City Administration Portal</span>
            </div>
          </Link>

          <nav className={`desktop-nav ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>E-Services</Link>

            <div className="nav-divider" />

            <div className="relative group">
              <Link to="/admin" className="admin-btn btn flex items-center gap-2">
                <User size={14} /> Admin Portal <ChevronDown size={12} />
              </Link>

              <div
                className="admin-dropdown-menu"
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '290px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 20px 40px rgba(0,53,128,0.15)',
                  border: '1px solid var(--gov-border)',
                  padding: '6px',
                  zIndex: 1000
                }}
              >
                <div style={{ padding: '6px 10px 8px', fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  Select Department Portal
                </div>
                {[
                  { href: '/admin', role: 'SUPER_ADMIN', icon: '👑', label: 'Super Admin (All Access)', color: '#003580' },
                  { href: '/admin/tax', role: 'TAX_ADMIN', icon: '🏢', label: 'Property Tax Admin', color: '#0369a1' },
                  { href: '/admin/water', role: 'WATER_ADMIN', icon: '💧', label: 'Water Supply Admin', color: '#b45309' },
                  { href: '/admin/complaints', role: 'GRIEVANCE_ADMIN', icon: '⚠️', label: 'Grievances Officer', color: '#b91c1c' },
                  { href: '/admin/certificates', role: 'CERTIFICATE_ADMIN', icon: '📜', label: 'Certificates Registrar', color: '#065f46' },
                  { href: '/admin/garbage', role: 'GARBAGE_ADMIN', icon: '🚛', label: 'Garbage & Sanitation', color: '#6d28d9' },
                ].map(item => (
                  <a
                    key={item.role}
                    href={item.href}
                    onClick={() => localStorage.setItem('activeDepartmentRole', item.role)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '6px', color: item.color, fontSize: '0.83rem', fontWeight: 700, textDecoration: 'none', marginBottom: '2px' }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      {!isLoginPage && (
        <footer className="gov-footer">
          <div className="gov-footer-tricolor">
            <div className="strip-saffron"></div>
            <div className="strip-white"></div>
            <div className="strip-green"></div>
          </div>

          <div className="footer-main">
            <div className="container footer-inner">

              {/* Brand Column */}
              <div className="footer-brand-section">
                <div className="footer-brand-logo">
                  <div className="footer-logo-icon">🏛️</div>
                  <div>
                    <div className="footer-brand-name">Nagar Parishad<br/>Khapa</div>
                    <div className="footer-brand-tag">Smart City • Maharashtra</div>
                  </div>
                </div>
                <p className="footer-desc">
                  Empowering citizens through transparent, digital, and efficient governance. Committed to service delivery excellence.
                </p>
                <div className="footer-certifications">
                  <span className="footer-cert-badge"><Shield size={10}/> ISO 9001:2015</span>
                  <span className="footer-cert-badge">🇮🇳 Digital India</span>
                  <span className="footer-cert-badge">✓ NIC Certified</span>
                </div>
              </div>

              {/* Information Links */}
              <div className="footer-links-section">
                <h4>Information</h4>
                <ul className="footer-link-list">
                  <li><Link to="/about">About Council</Link></li>
                  <li><Link to="#">Vision &amp; Mission</Link></li>
                  <li><Link to="#">City History</Link></li>
                  <li><Link to="#">Tenders &amp; Notices</Link></li>
                  <li><Link to="#">RTI Act</Link></li>
                  <li><Link to="#">Annual Reports</Link></li>
                </ul>
              </div>

              {/* E-Services Links */}
              <div className="footer-links-section">
                <h4>E-Services</h4>
                <ul className="footer-link-list">
                  <li><Link to="/services">Pay Property Tax</Link></li>
                  <li><Link to="/services">Water Bill Payment</Link></li>
                  <li><Link to="/services">Birth/Death Certificate</Link></li>
                  <li><Link to="/services">Register Grievance</Link></li>
                  <li><Link to="/services">Trade License</Link></li>
                  <li><Link to="/services">Building Permission</Link></li>
                </ul>
              </div>

              {/* Helpdesk */}
              <div className="footer-contact-section">
                <h4>Helpdesk</h4>
                <div className="helpline-box">
                  <span className="helpline-label">📞 Toll Free Helpline</span>
                  <span className="helpline-number">1800-123-4567</span>
                  <span className="helpline-tag">24×7 | Mon – Sat | 9 AM – 6 PM</span>
                </div>
                <div className="contact-info-row">
                  <Mail size={13} />
                  <span>support@nagarparishad.gov.in</span>
                </div>
                <div className="contact-info-row">
                  <Globe size={13} />
                  <span>www.nagarparishadkhapa.gov.in</span>
                </div>
                <div className="contact-info-row" style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                  <Shield size={11} />
                  <span>Secured by NIC • SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="footer-bottom">
            <div className="container footer-bottom-inner">
              <p className="footer-copyright">
                © {new Date().getFullYear()} Nagar Parishad Khapa. All rights reserved. | Content Owned &amp; Maintained by Nagar Parishad Khapa.
              </p>
              <div className="footer-gov-stamp">
                <span>🇮🇳</span>
                <span>A Government of Maharashtra Initiative</span>
              </div>
              <div className="footer-legal-links">
                <Link to="#">Privacy Policy</Link>
                <Link to="#">Terms of Use</Link>
                <Link to="#">Disclaimer</Link>
                <Link to="#">Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Advanced Features */}
      <AccessibilityWidget />
      <Chatbot />
    </div>
  );
};

export default PublicLayout;
