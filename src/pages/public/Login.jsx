import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Lock, User, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectUrl = searchParams.get('redirect') || '/admin/tax';
  const serviceTitle = searchParams.get('title') || 'Property Tax Portal';

  const [portalType, setPortalType] = useState('citizen'); // 'citizen' | 'officer' | 'admin'
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // Store mock session token
    localStorage.setItem('userAuthenticated', 'true');
    localStorage.setItem('userRole', portalType);
    
    setTimeout(() => {
      setLoading(false);
      navigate(redirectUrl);
    }, 800);
  };

  return (
    <div className="tiranga-login-container">
      
      {/* Ambient Glows */}
      <div className="glow-saffron"></div>
      <div className="glow-green"></div>
      <div className="glow-navy"></div>

      <motion.div 
        className="tiranga-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Top Tricolor Strip */}
        <div className="tiranga-strip">
          <div className="strip-saffron"></div>
          <div className="strip-white"></div>
          <div className="strip-green"></div>
        </div>

        <div className="tiranga-card-body">
          
          {/* Emblem Header */}
          <div className="emblem-badge-wrapper">
            <div className="emblem-icon-box">
              <div className="chakra-spin-ring"></div>
              <Building2 size={26} color="#EA580C" />
            </div>

            <div className="govt-tag">
              <Sparkles size={12} color="#EA580C" />
              <span>Nagar Parishad Khapa • Smart City Portal</span>
            </div>

            <h1 className="portal-heading">
              {serviceTitle}
            </h1>
            <p className="portal-subheading">
              Secure National Civic Portal • Authorised Single Sign-On
            </p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              onClick={() => setPortalType('citizen')}
              className={`tab-btn ${portalType === 'citizen' ? 'active-citizen' : ''}`}
            >
              Citizen
            </button>

            <button
              type="button"
              onClick={() => setPortalType('officer')}
              className={`tab-btn ${portalType === 'officer' ? 'active-officer' : ''}`}
            >
              Officer
            </button>

            <button
              type="button"
              onClick={() => setPortalType('admin')}
              className={`tab-btn ${portalType === 'admin' ? 'active-admin' : ''}`}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="field-label">
                {portalType === 'citizen' ? 'Property ID / Mobile / Aadhar' : 'Official Officer ID'}
              </label>
              <div className="input-box-wrapper">
                <User size={18} className="field-icon" />
                <input 
                  type="text" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={portalType === 'citizen' ? 'e.g. PID-102948' : 'e.g. OFF-8831'} 
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                Password
              </label>
              <div className="input-box-wrapper">
                <Lock size={18} className="field-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="field-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-eye-btn"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options-row">
              <label className="remember-label">
                <input type="checkbox" defaultChecked className="remember-checkbox" />
                <span>Stay logged in</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-tiranga"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Proceed to {serviceTitle}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="quick-demo-section">
            <p className="quick-demo-title">
              Instant Demo Access:
            </p>
            
            <button
              type="button"
              onClick={() => handleLogin()}
              className="btn-quick-demo"
            >
              <CheckCircle2 size={16} />
              <span>⚡ 1-Click Quick Demo Login ({serviceTitle})</span>
            </button>
          </div>

        </div>

        {/* Footer Accent */}
        <div className="tiranga-card-footer">
          <span className="footer-shield">
            <ShieldCheck size={14} color="#10B981" />
            Government Digital Standards Encrypted
          </span>
          <span className="footer-dept">Khapa Council Digital Cell</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
