import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Target, Eye, Award, Users2, ShieldCheck, MapPin, Milestone } from 'lucide-react';
import './Home.css';

const About = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const milestones = [
    { year: '1965', title: 'Establishment', desc: 'Nagar Parishad Khapa was officially constituted as a civic body.' },
    { year: '2015', title: 'Swachh Bharat Initiate', desc: 'Launched 100% door-to-door waste collection drive.' },
    { year: '2022', title: 'Digital Governance', desc: 'Implemented online property tax & bill payment portals.' },
    { year: '2026', title: 'Smart City Upgrade', desc: 'Introduced AI Grievance AI Bot & Live GPS Garbage Truck Tracking.' },
  ];

  const leaders = [
    { name: 'Rajesh Deshmukh', role: 'Chief Officer', dept: 'Executive Administration' },
    { name: 'Priya Sharma', role: 'City Engineer', dept: 'Public Works & Infrastructure' },
    { name: 'Sanjay Verma', role: 'Sanitation Inspector', dept: 'Solid Waste Management' },
    { name: 'Anil Kulkarni', role: 'Tax Superintendent', dept: 'Revenue & Finance' },
  ];

  return (
    <div className="about-page py-12">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <span className="hero-badge mb-4 inline-block">🏛️ About Nagar Parishad Khapa</span>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Building a Sustainable & Digital Tomorrow</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Dedicated to providing transparent civic governance, modern public services, and infrastructure development to elevate the living standard of every citizen in Khapa.
          </p>
        </motion.div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          <motion.div 
            className="advanced-glass p-8 rounded-2xl border border-slate-200 shadow-sm"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Eye size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              To turn Khapa into a smart, eco-friendly, and self-sufficient municipal region with 100% digital service delivery, automated waste management, and sustainable civic infrastructure.
            </p>
          </motion.div>

          <motion.div 
            className="advanced-glass p-8 rounded-2xl border border-slate-200 shadow-sm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Deliver prompt public services, ensure clean drinking water, maintain sanitation standards, resolve citizen grievances within 48 hours, and foster open communication between citizens and city officials.
            </p>
          </motion.div>
        </div>

        {/* Historical Milestones */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10 flex items-center justify-center gap-2">
            <Milestone className="text-indigo-600" /> Key Milestones & Growth
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {milestones.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="text-3xl font-black text-indigo-600 mb-2">{item.year}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10 flex items-center justify-center gap-2">
            <Users2 className="text-indigo-600" /> Executive Leadership
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {leaders.map((leader, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-xs">
                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 text-2xl font-bold">
                  {leader.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{leader.name}</h3>
                <p className="text-indigo-600 font-semibold text-sm mb-1">{leader.role}</p>
                <p className="text-slate-500 text-xs">{leader.dept}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
