import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Droplet, AlertTriangle, FileText, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

const CitizenServices = () => {
  const navigate = useNavigate();

  const publicServices = [
    { 
      title: 'Pay Property Tax', 
      desc: 'Calculate property tax dues, pay online securely, and download payment receipts instantly.', 
      icon: <Building size={40} strokeWidth={1.5} />, 
      color: '#0ea5e9',
      badge: 'Popular',
      link: '/admin/tax'
    },
    { 
      title: 'Water Bill Payment', 
      desc: 'Check monthly water meter readings, clear pending water bills, or request a new connection.', 
      icon: <Droplet size={40} strokeWidth={1.5} />, 
      color: '#eab308',
      badge: 'Instant',
      link: '/admin/water'
    },
    { 
      title: 'Register Grievance', 
      desc: 'Report potholes, streetlight outages, garbage issues, or public grievances directly to officials.', 
      icon: <AlertTriangle size={40} strokeWidth={1.5} />, 
      color: '#ef4444',
      badge: '24/7 SLA',
      link: '/admin/complaints'
    },
    { 
      title: 'Certificates Portal', 
      desc: 'Apply for official Birth, Death, or Marriage certificates with digital verification.', 
      icon: <FileText size={40} strokeWidth={1.5} />, 
      color: '#10b981',
      badge: 'Verified',
      link: '/admin/certificates'
    },
    { 
      title: 'Live Garbage Tracking', 
      desc: 'Check live location of garbage collection vehicles in your ward and timings.', 
      icon: <Truck size={40} strokeWidth={1.5} />, 
      color: '#8b5cf6',
      badge: 'Live Map',
      link: '/admin/garbage'
    },
  ];

  const handleOpenModal = (svc) => {
    navigate(`/login?redirect=${encodeURIComponent(svc.link)}&title=${encodeURIComponent(svc.title)}`);
  };

  return (
    <div className="citizen-services-page py-12" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '85vh' }}>
      <div className="container">
        <div className="text-center mb-12">
          <span className="live-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span className="text-sm font-semibold uppercase tracking-wider text-muted ml-2">Online Self-Service Portal</span>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 800, marginTop: '0.5rem' }}>
            Nagar Parishad E-Services
          </h2>
          <p className="text-muted max-w-2xl mx-auto mt-2" style={{ fontSize: '1.1rem' }}>
            Select a service below to file applications, pay municipal dues, or track city services in real-time.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {publicServices.map((svc, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => handleOpenModal(svc)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: svc.color,
                      backgroundColor: `${svc.color}18`
                    }}
                  >
                    {svc.icon}
                  </div>
                  <span 
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: `${svc.color}15`,
                      color: svc.color
                    }}
                  >
                    {svc.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                  {svc.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {svc.desc}
                </p>
              </div>

              <div 
                className="mt-6 pt-4 flex items-center justify-between" 
                style={{ borderTop: '1px solid #f1f5f9', color: svc.color, fontWeight: 600, fontSize: '0.95rem' }}
              >
                <span>Access Service</span>
                <ArrowRight size={18} />
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid var(--color-border)' }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck size={40} color="var(--color-primary)" />
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Need Official Admin Management Access?</h4>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Municipal staff and department officers can log into dedicated department dashboards.</p>
            </div>
          </div>
          <a href="/login?redirect=/admin" className="btn btn-outline-dark" style={{ whiteSpace: 'nowrap' }}>
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default CitizenServices;

