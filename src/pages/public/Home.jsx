import React, { useState } from 'react';
import { ArrowRight, FileText, AlertTriangle, Building, Droplet, Speaker, Users, Activity, ShieldCheck, MapPin, ChevronRight, Truck, Bell, Briefcase, Search, CheckCircle2, PhoneCall, Zap, Clock, ExternalLink, Sparkles, Navigation, X, Calculator, Download, Check, Award, BadgeCheck, Globe, Compass, Landmark, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KHAPA_PROPERTIES } from '../../data/khapaLandRecords';
import ServiceModal from '../../components/ServiceModal';
import { Globe3D } from '../../components/ui/3d-globe';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Advanced feature states
  const [quickQuery, setQuickQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedWard, setSelectedWard] = useState('Ward 01');

  // Khapa Wards Data with Real-time Municipal Metrics
  const WARD_DIRECTORY = [
    { id: 'w1', name: 'Ward 01 - Shivaji Ward', officer: 'Suresh Patil (JE)', contact: '07118-242101', waterStatus: 'Normal (4 hrs)', cleanStatus: 'Completed 07:30 AM', truckLive: 'MH-31-AP-1021', complaintsOpen: 2 },
    { id: 'w2', name: 'Ward 02 - Ambedkar Ward', officer: 'Prakash Meshram (AE)', contact: '07118-242102', waterStatus: 'Normal (4 hrs)', cleanStatus: 'In Progress', truckLive: 'MH-31-AP-1024', complaintsOpen: 4 },
    { id: 'w3', name: 'Ward 03 - Somwar Peth', officer: 'Rajesh Thakre (Incharge)', contact: '07118-242103', waterStatus: 'Water Tanker Active', cleanStatus: 'Completed 06:45 AM', truckLive: 'MH-31-AP-1022', complaintsOpen: 1 },
    { id: 'w4', name: 'Ward 04 - Budhwar Peth', officer: 'Vijay Bhoyar (JE)', contact: '07118-242104', waterStatus: 'Maintenance till 4 PM', cleanStatus: 'Completed 08:15 AM', truckLive: 'MH-31-AP-1025', complaintsOpen: 5 },
    { id: 'w5', name: 'Ward 05 - Koliwada / Riverfront', officer: 'Anil Dhote (Health Insp)', contact: '07118-242105', waterStatus: 'High Pressure Supply', cleanStatus: 'Riverfront Swept', truckLive: 'MH-31-AP-1023', complaintsOpen: 0 },
    { id: 'w6', name: 'Ward 06 - Station Road', officer: 'Kavita Deshmukh (Inspector)', contact: '07118-242106', waterStatus: 'Normal (3.5 hrs)', cleanStatus: 'Completed 07:00 AM', truckLive: 'MH-31-AP-1026', complaintsOpen: 3 },
  ];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    setHasSearched(true);
    const q = quickQuery.toLowerCase().trim();

    // 1. Check in Land & Property Records
    const propMatch = KHAPA_PROPERTIES.find(p => 
      p.pid.toLowerCase().includes(q) ||
      p.owner_name.toLowerCase().includes(q) ||
      p.owner_phone.includes(q) ||
      (p.cts_number && p.cts_number.toLowerCase().includes(q))
    );

    if (propMatch) {
      setSearchResult({
        type: 'property',
        title: `Property: ${propMatch.pid}`,
        owner: propMatch.owner_name,
        ward: propMatch.ward,
        due: propMatch.tax_due,
        status: propMatch.tax_due === 0 ? 'No Dues (Paid)' : `Due: ₹${propMatch.tax_due}`,
        link: `/admin/tax`,
        detail: `${propMatch.property_type} • ${propMatch.area_sqft} sq.ft • ${propMatch.address}`
      });
      return;
    }

    // 2. Mock Application ID check (BTH / DTH / CMP)
    if (q.startsWith('bth') || q.startsWith('dth') || q.startsWith('mrg')) {
      setSearchResult({
        type: 'certificate',
        title: `Certificate Application #${quickQuery.toUpperCase()}`,
        owner: 'Applicant Verified',
        ward: 'Central Records Office',
        status: 'Digitally Signed & Ready for Download',
        link: `/admin/certificates`,
        detail: 'DigiLocker QR Hash: SHA256:7f9a12c8... Issued under RTS Act 2015'
      });
      return;
    }

    // 3. Complaint ID
    if (q.startsWith('cmp') || q.includes('pothole') || q.includes('water')) {
      setSearchResult({
        type: 'complaint',
        title: `Grievance Token #${quickQuery.toUpperCase()}`,
        owner: 'Assigned to Ward Engineer',
        ward: 'SLA Remaining: 14 hrs',
        status: 'Work Order In Progress',
        link: `/admin/complaints`,
        detail: 'Municipal Field Team dispatched with geo-tagged verification.'
      });
      return;
    }

    // Default fallback - not found
    setSearchResult(null);
  };

  const services = [
    { title: 'Property Tax', desc: 'Manage tax records, check property dues, and pay online securely.', icon: <Building size={36} strokeWidth={1.5} />, link: '/admin/tax', color: '#0ea5e9' },
    { title: 'Water Billing', desc: 'Monitor water usage metrics and pay monthly water connection bills.', icon: <Droplet size={36} strokeWidth={1.5} />, link: '/admin/water', color: '#eab308' },
    { title: 'Grievances', desc: 'Report potholes, water issues, and civic grievances to municipal officers.', icon: <AlertTriangle size={36} strokeWidth={1.5} />, link: '/admin/complaints', color: '#ef4444' },
    { title: 'Certificates', desc: 'Apply and track Birth, Death, and Marriage certificate applications.', icon: <FileText size={36} strokeWidth={1.5} />, link: '/admin/certificates', color: '#10b981' },
    { title: 'Garbage Tracking', desc: 'Monitor live garbage trucks, check missed wards, and track active vehicles.', icon: <Truck size={36} strokeWidth={1.5} />, link: '/admin/garbage', color: '#8b5cf6' },
  ];

  const handleCardClick = (e, svc) => {
    e.preventDefault();
    navigate(`/login?redirect=${encodeURIComponent(svc.link)}&title=${encodeURIComponent(svc.title)}`);
  };

  const stats = [
    { label: 'Registered Citizens', value: '1.2M+', icon: <Users size={24} /> },
    { label: 'Complaints Resolved', value: '98%', icon: <ShieldCheck size={24} /> },
    { label: 'Active Projects', value: '145', icon: <Activity size={24} /> },
    { label: 'Wards Covered', value: '64', icon: <MapPin size={24} /> },
  ];

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-particles"></div>
        
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="hero-badge">
              <span className="live-dot"></span> 🇮🇳 Official Digital Governance Portal — Maharashtra
            </motion.div>
            <motion.h2 variants={fadeUp}>
              Nagar Parishad Khapa<br/>
              <span className="text-gradient">Serving You, Digitally.</span>
            </motion.h2>
            <motion.p variants={fadeUp}>
              Your official smart city portal for property tax, water billing, birth certificates, public grievances, and civic services — fast, transparent and secure.
            </motion.p>
            <motion.div variants={fadeUp} className="hero-actions flex gap-4">
              <Link to="/services" className="btn btn-primary btn-glow">
                🏛️ Access E-Services <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link to="/about" className="btn btn-outline-advanced">
                About Council
              </Link>
            </motion.div>

            {/* Quick Citizen Search Engine */}
            <motion.div variants={fadeUp} className="hero-search-box">
              <form onSubmit={handleQuickSearch} className="hero-search-form">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  value={quickQuery}
                  onChange={(e) => {
                    setQuickQuery(e.target.value);
                    if (!e.target.value) setHasSearched(false);
                  }}
                  placeholder="Instant Track: Property PID (e.g. KP-441101-0101), Grievance ID, or Name..."
                  className="hero-search-input"
                />
                {quickQuery && (
                  <button type="button" onClick={() => { setQuickQuery(''); setHasSearched(false); setSearchResult(null); }} className="clear-search-btn">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="hero-search-btn">
                  Track Record <ArrowRight size={15} />
                </button>
              </form>

              {/* Instant Search Result Overlay Card */}
              <AnimatePresence>
                {hasSearched && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="quick-search-result-card"
                  >
                    {searchResult ? (
                      <div className="search-result-inner">
                        <div className="result-header">
                          <div className="flex items-center gap-2">
                            <span className="result-badge-live">
                              <CheckCircle2 size={14} /> Official Verified Record
                            </span>
                            <span className="result-type-tag">{searchResult.type.toUpperCase()}</span>
                          </div>
                          <button onClick={() => setHasSearched(false)} className="close-result-btn">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="result-body">
                          <h4 className="result-title">{searchResult.title}</h4>
                          <p className="result-detail">{searchResult.detail}</p>
                          <div className="result-meta-row">
                            <span><strong>Citizen / Owner:</strong> {searchResult.owner}</span>
                            <span><strong>Location:</strong> {searchResult.ward}</span>
                            <span className={`status-pill ${searchResult.due === 0 ? 'status-paid' : 'status-pending'}`}>
                              {searchResult.status}
                            </span>
                          </div>
                        </div>
                        <div className="result-footer">
                          <span className="result-notice">Secured by MahaBhulekh & Smart Khapa Municipal DB</span>
                          <Link to={searchResult.link} className="result-action-btn">
                            Open Official Registry <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="search-result-inner not-found">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                            <AlertTriangle size={16} /> No direct record matching "{quickQuery}"
                          </div>
                          <button onClick={() => setHasSearched(false)} className="close-result-btn"><X size={16}/></button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Try searching by Property PID like <strong>KP-441101-0101</strong>, or citizen name like <strong>Rajesh</strong>, or grievance prefix <strong>CMP-</strong>.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hero Stats Strip */}
            <motion.div variants={fadeUp} className="hero-stats-strip">
              {stats.map((stat, i) => (
                <div key={i} className="hero-stat-item">
                  <span className="hero-stat-num">{stat.value}</span>
                  <span className="hero-stat-lbl">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Marquee inside Hero */}
        <motion.div 
          className="hero-marquee-wrapper"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="container">
            <div className="glass-marquee">
              <div className="marquee-label">
                <Speaker size={18} className="animate-pulse" /> <span>Live Updates</span>
              </div>
              <div className="marquee-container">
                <div className="marquee-content">
                  <span>✨ Property tax rebate of 5% extended till 31st August.</span>
                  <span>✨ Water supply will be disrupted in Ward 4 on Sunday due to maintenance.</span>
                  <span>✨ New trade license application portal is now live.</span>
                  <span>✨ Participate in the upcoming Swachh Bharat Abhiyan drive this weekend.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CEO Message Section */}
      <section className="ceo-section">
        <div className="ceo-bg-pattern"></div>
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <h2 className="section-title">Leadership Vision</h2>
            <p className="section-subtitle">Driving the development and progress of Khapa City</p>
          </motion.div>

          <motion.div 
            className="ceo-compact-wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="ceo-image-side">
              <motion.div 
                className="ceo-image-box"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop" alt="Chief Officer" className="ceo-photo" />
                <div className="ceo-badge">
                  <div className="ceo-badge-name">Rajesh Deshmukh</div>
                  <div className="ceo-badge-title">Chief Officer</div>
                </div>
              </motion.div>
            </motion.div>

            <div className="ceo-text-side">
              <motion.h2 variants={fadeUp} className="ceo-heading">Message from the Chief Officer</motion.h2>
              
              <motion.div variants={fadeUp} className="ceo-quote-box">
                <span className="quote-mark">"</span>
                <p>
                  Our vision is to transform Khapa into a model city with modern infrastructure, impeccable cleanliness, and transparent governance.
                </p>
              </motion.div>
              
              <motion.p variants={fadeUp} className="ceo-paragraph">
                At Nagar Parishad Khapa, we are working tirelessly to ensure that every citizen has access to clean water, smooth roads, quality education, and rapid public services. Through our various departments, we are executing high-impact projects designed to uplift the standard of living for everyone in Khapa.
              </motion.p>
              
              <motion.div variants={fadeUp} className="ceo-footer">
                <div className="ceo-sign-text">
                  <span className="ceo-name-sig">- Rajesh Deshmukh</span>
                  <span className="ceo-title-sig">Chief Executive Officer, Khapa</span>
                </div>
                <button className="btn-text">Read More <ArrowRight size={14} className="ml-2"/></button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, idx) => (
              <motion.div key={idx} variants={fadeUp} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Services Section */}
      <section className="services-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-tag">
              <span className="live-dot-small"></span> Government E-Services Portal
            </div>
            <h2 className="section-title">Essential <span className="highlight">Civic Services</span></h2>
            <p className="section-subtitle">Access all government services quickly and securely through our official digital portal — available 24×7.</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-4 gap-8 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {services.map((svc, i) => (
              <motion.div variants={fadeUp} key={i}>
                <div onClick={(e) => handleCardClick(e, svc)} className="service-card group" style={{ cursor: 'pointer' }}>
                  <div className="service-card-inner">
                    <div className="icon-wrapper" style={{ color: svc.color, backgroundColor: `${svc.color}15` }}>
                      {svc.icon}
                    </div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                    <div className="link-text">
                      Access Service <ChevronRight size={16} />
                    </div>
                  </div>
                  <div className="card-hover-border" style={{ background: `linear-gradient(135deg, ${svc.color}, transparent)` }}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature: Interactive 3D Earth Globe & National Digital Governance Grid */}
      <section className="india-geo-section">
        <div className="container">
          <div className="india-geo-card">
            {/* Left: Interactive 3D Earth Globe */}
            <div className="india-map-pane globe-3d-pane">
              <div className="map-badge-live">
                <Radio size={14} className="animate-pulse text-emerald-400" />
                <span>Global & National Geospatial Grid • Khapa Node (21.42° N)</span>
              </div>

              <div className="globe-container-wrap">
                <Globe3D
                  className="w-full h-full"
                  markers={[
                    {
                      lat: 21.4194,
                      lng: 78.9629,
                      src: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&auto=format&fit=crop&q=80",
                      label: "Nagar Parishad Khapa (Central Node)",
                      size: 0.1
                    },
                    {
                      lat: 28.6139,
                      lng: 77.209,
                      src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&auto=format&fit=crop&q=80",
                      label: "New Delhi (NIC National HQ)"
                    },
                    {
                      lat: 18.922,
                      lng: 72.8347,
                      src: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=100&auto=format&fit=crop&q=80",
                      label: "Mumbai (Mantralaya MH)"
                    },
                    {
                      lat: 12.9716,
                      lng: 77.5946,
                      src: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&auto=format&fit=crop&q=80",
                      label: "Bengaluru (ISRO & Digital Hub)"
                    },
                    {
                      lat: 22.5726,
                      lng: 88.3639,
                      src: "https://images.unsplash.com/photo-1558431382-27e303142255?w=100&auto=format&fit=crop&q=80",
                      label: "Kolkata (Eastern Data Center)"
                    },
                    {
                      lat: 25.2048,
                      lng: 55.2708,
                      src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&auto=format&fit=crop&q=80",
                      label: "Dubai (Global Trade Gateway)"
                    },
                    {
                      lat: 51.5074,
                      lng: -0.1278,
                      src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&auto=format&fit=crop&q=80",
                      label: "London"
                    },
                    {
                      lat: 40.7128,
                      lng: -74.006,
                      src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=100&auto=format&fit=crop&q=80",
                      label: "New York (UN Habitat)"
                    }
                  ]}
                  config={{
                    radius: 2.85,
                    showAtmosphere: true,
                    atmosphereColor: "#0284c7",
                    atmosphereIntensity: 0.55,
                    atmosphereBlur: 2.5,
                    bumpScale: 3,
                    autoRotateSpeed: 0.4,
                    enableZoom: true,
                    minDistance: 4.2,
                    maxDistance: 7.5,
                    ambientIntensity: 1.3,
                    pointLightIntensity: 2.4,
                    backgroundColor: "transparent",
                  }}
                  onMarkerClick={(m) => {
                    alert(`Selected Node: ${m.label}\nCoordinates: ${m.lat}° N, ${m.lng}° E`);
                  }}
                />
              </div>

              {/* Coordinate HUD Tag */}
              <div className="map-coords-hud">
                <span>DRAG TO ROTATE 3D GLOBE • SCROLL TO ZOOM</span>
                <span>GEO-SYNC: ACTIVE</span>
              </div>
            </div>

            {/* Right: National Digital Stack & Civic Impact Live Stream */}
            <div className="india-details-pane">
              <div className="section-tag-small">
                <Compass size={14} className="text-gov-saffron" /> National e-Governance Mission
              </div>
              <h3 className="india-pane-title">Connected with India's Smart Digital Public Infrastructure</h3>
              <p className="india-pane-desc">
                Nagar Parishad Khapa is unified with Government of India & Government of Maharashtra core digital stacks for instant authentication, direct DBT, and paperless registry.
              </p>

              {/* 4 Connected National Pillars */}
              <div className="national-pillars-grid">
                <div className="pillar-item">
                  <div className="pillar-icon bg-blue-50 text-blue-600 border border-blue-200">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h5 className="pillar-name">MahaBhulekh (७/१२)</h5>
                    <p className="pillar-detail">Direct sync with Maharashtra land records & digital property PR cards.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <BadgeCheck size={20} />
                  </div>
                  <div>
                    <h5 className="pillar-name">DigiLocker Ecosystem</h5>
                    <p className="pillar-detail">QR-verifiable birth, death and trade certificates with tamper-proof SHA-256 seal.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon bg-amber-50 text-amber-600 border border-amber-200">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="pillar-name">Aadhaar e-KYC & DBT</h5>
                    <p className="pillar-detail">Zero-leakage municipal welfare grants, pension disbursal, and vendor payouts.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon bg-purple-50 text-purple-600 border border-purple-200">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h5 className="pillar-name">National GIS BharatMaps</h5>
                    <p className="pillar-detail">Satellite ward geotagging, water pipeline telemetry & fleet tracking.</p>
                  </div>
                </div>
              </div>

              {/* Real-time sync ticker strip */}
              <div className="national-sync-status">
                <div className="sync-left">
                  <span className="live-dot-small"></span>
                  <span className="text-xs font-bold text-slate-700">Digital India Gateway: <strong className="text-emerald-600">CONNECTED (99.98% Uptime)</strong></span>
                </div>
                <Link to="/about" className="sync-link">
                  Know Architecture <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Real-Time Ward Intelligence & Civic Status Monitor */}
      <section className="ward-intelligence-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-tag">
              <span className="live-dot-small"></span> Smart City Command & Control (ICCC)
            </div>
            <h2 className="section-title">Khapa Ward <span className="highlight">Live Civic Pulse</span></h2>
            <p className="section-subtitle">Real-time telemetry of municipal operations, water schedule, garbage sweepers, and ward officers.</p>
          </motion.div>

          <div className="ward-telemetry-container">
            {/* Ward selector tabs */}
            <div className="ward-tabs-nav">
              {WARD_DIRECTORY.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWard(w.name.split(' - ')[0])}
                  className={`ward-tab-btn ${selectedWard === w.name.split(' - ')[0] ? 'active' : ''}`}
                >
                  <MapPin size={14} />
                  <span>{w.name.split(' - ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Ward Dashboard Details */}
            {(() => {
              const activeData = WARD_DIRECTORY.find(w => w.name.startsWith(selectedWard)) || WARD_DIRECTORY[0];
              return (
                <motion.div 
                  key={activeData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ward-detail-card"
                >
                  <div className="ward-detail-header">
                    <div>
                      <span className="ward-status-badge">⚡ Live Municipal Feed</span>
                      <h3 className="ward-name-heading">{activeData.name}</h3>
                    </div>
                    <div className="ward-officer-info">
                      <span className="text-xs text-slate-400">Nodal Ward Officer</span>
                      <strong className="text-sm text-slate-800 block">{activeData.officer}</strong>
                      <a href={`tel:${activeData.contact}`} className="officer-call-btn">
                        <PhoneCall size={12} /> {activeData.contact}
                      </a>
                    </div>
                  </div>

                  <div className="ward-metrics-grid">
                    <div className="ward-metric-box">
                      <div className="metric-icon-wrap water-metric">
                        <Droplet size={18} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Water Supply Schedule</span>
                        <strong className="metric-value">{activeData.waterStatus}</strong>
                        <span className="metric-sub">Pumping Station Active</span>
                      </div>
                    </div>

                    <div className="ward-metric-box">
                      <div className="metric-icon-wrap truck-metric">
                        <Truck size={18} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Cleanliness & Waste Sweep</span>
                        <strong className="metric-value">{activeData.cleanStatus}</strong>
                        <span className="metric-sub">Vehicle: {activeData.truckLive}</span>
                      </div>
                    </div>

                    <div className="ward-metric-box">
                      <div className="metric-icon-wrap grievance-metric">
                        <AlertTriangle size={18} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Open Grievances</span>
                        <strong className="metric-value">{activeData.complaintsOpen} Active SLA Tickets</strong>
                        <span className="metric-sub">Resolution Rate: 96.8%</span>
                      </div>
                    </div>

                    <div className="ward-metric-box action-metric">
                      <div className="metric-icon-wrap zap-metric">
                        <Zap size={18} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Citizen Quick Action</span>
                        <Link to="/admin/complaints" className="ward-action-link">
                          Report Issue in this Ward <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Information Board (Public Notices & Latest Tenders) */}
      <section className="info-board">
        <div className="container">
          <div className="info-board-grid">
            {/* Notices Card */}
            <motion.div 
              className="gov-info-card notices-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="gov-info-card-header">
                <div className="gov-card-title-group">
                  <div className="gov-card-icon-wrap notice-icon-wrap">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="gov-card-title">Public Notices</h3>
                    <span className="gov-card-subtitle">Official announcements & circulars</span>
                  </div>
                </div>
                <button className="gov-view-all-btn">
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="ticker-wrap">
                <ul className="info-list info-list-scroll">
                  {[
                    { date: '15 Aug', title: 'Independence Day Ceremony', desc: 'Flag hoisting ceremony details and schedule at the main municipal ground.', type: 'normal' },
                    { date: '10 Aug', title: 'Solid Waste Management', desc: 'Revised guidelines for mandatory source segregation of solid waste.', type: 'normal' },
                    { date: '05 Aug', title: 'Voter List Publication', desc: 'Draft publication of voter list for Ward No. 12 available for review.', type: 'normal' },
                    { date: '15 Aug', title: 'Independence Day Ceremony', desc: 'Flag hoisting ceremony details and schedule at the main municipal ground.', type: 'normal' },
                    { date: '10 Aug', title: 'Solid Waste Management', desc: 'Revised guidelines for mandatory source segregation of solid waste.', type: 'normal' },
                    { date: '05 Aug', title: 'Voter List Publication', desc: 'Draft publication of voter list for Ward No. 12 available for review.', type: 'normal' }
                  ].map((item, idx) => (
                    <li key={idx}>
                      <div className={`date-badge ${item.type}`}>{item.date}</div>
                      <div className="info-content">
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            {/* Tenders Card */}
            <motion.div 
              className="gov-info-card tenders-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="gov-info-card-header">
                <div className="gov-card-title-group">
                  <div className="gov-card-icon-wrap tender-icon-wrap">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="gov-card-title">Latest Tenders</h3>
                    <span className="gov-card-subtitle">Procurement & e-tendering notices</span>
                  </div>
                </div>
                <button className="gov-view-all-btn tender-btn">
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="ticker-wrap">
                <ul className="info-list info-list-scroll">
                  {[
                    { date: 'Close 25 Aug', title: 'Road Construction (Ward 7)', desc: 'Construction of concrete road in Shivaji Nagar area.', type: 'warning' },
                    { date: 'Close 22 Aug', title: 'LED Street Lights', desc: 'Supply and installation of LED street lights for the main highway.', type: 'warning' },
                    { date: 'Close 20 Aug', title: 'AMC for Water Pumps', desc: 'Annual maintenance contract for municipal water pumping stations.', type: 'warning' },
                    { date: 'Close 25 Aug', title: 'Road Construction (Ward 7)', desc: 'Construction of concrete road in Shivaji Nagar area.', type: 'warning' },
                    { date: 'Close 22 Aug', title: 'LED Street Lights', desc: 'Supply and installation of LED street lights for the main highway.', type: 'warning' },
                    { date: 'Close 20 Aug', title: 'AMC for Water Pumps', desc: 'Annual maintenance contract for municipal water pumping stations.', type: 'warning' }
                  ].map((item, idx) => (
                    <li key={idx}>
                      <div className={`date-badge ${item.type}`}>{item.date}</div>
                      <div className="info-content">
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Relocated Emergency & Rapid Citizen Helpline Section (Clean Bottom Government Style) */}
      <section className="gov-emergency-bottom-bar">
        <div className="container">
          <div className="gov-emergency-card">
            <div className="emergency-callout-left">
              <div className="gov-em-icon-box">
                <PhoneCall size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="live-dot-small"></span>
                  <span className="em-kicker">24×7 Citizen Helpline & Rapid Response</span>
                </div>
                <h3 className="em-headline">Need Urgent Municipal or Emergency Assistance?</h3>
                <p className="em-subtext">Immediate toll-free civic dispatch for water burst, sanitation breakdown, fire, or health emergencies.</p>
              </div>
            </div>

            <div className="emergency-quick-dials">
              <a href="tel:18001230987" className="em-dial-card tollfree-highlight">
                <div className="dial-badge">TOLL FREE</div>
                <span className="dial-num">1800-123-0987</span>
                <span className="dial-lbl">Nagar Parishad Khapa</span>
              </a>

              <a href="tel:101" className="em-dial-card">
                <span className="dial-num">101</span>
                <span className="dial-lbl">Fire & Rescue</span>
              </a>

              <a href="tel:108" className="em-dial-card">
                <span className="dial-num">108</span>
                <span className="dial-lbl">Ambulance</span>
              </a>

              <a href="tel:112" className="em-dial-card">
                <span className="dial-num">112</span>
                <span className="dial-lbl">Police / SOS</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Icon
const DropletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
);

export default Home;
