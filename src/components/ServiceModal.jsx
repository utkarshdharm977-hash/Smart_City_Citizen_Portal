import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle, Upload, Send } from 'lucide-react';
import './ServiceModal.css';

const ServiceModal = ({ isOpen, onClose, service }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep(1), 300);
    }
  }, [isOpen]);

  if (!service) return null;

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const renderContent = () => {
    if (service.title === 'Pay Property Tax' || service.title === 'Water Bill Payment') {
      return (
        <div className="modal-feature-form">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3>Enter Details</h3>
                <p>Please enter your unique ID to fetch your dues.</p>
                <div className="input-group">
                  <input type="text" placeholder={service.title === 'Pay Property Tax' ? "Enter Property ID (e.g. PID-1029)" : "Enter Consumer Number"} />
                  <button className="btn-search" onClick={handleAction} disabled={loading}>
                    {loading ? <div className="spinner"></div> : <Search size={18} />}
                  </button>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="success-view">
                <CheckCircle size={48} color="var(--color-tertiary)" />
                <h3>Details Fetched!</h3>
                <div className="bill-card">
                  <div className="bill-row"><span>Name:</span> <strong>Ramesh Kumar</strong></div>
                  <div className="bill-row"><span>Amount Due:</span> <strong className="amount">₹ 2,450.00</strong></div>
                  <div className="bill-row"><span>Due Date:</span> <strong>31 Aug 2026</strong></div>
                </div>
                <button className="btn-pay" onClick={() => setStep(3)}>Pay Now Securely</button>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-view">
                 <div className="success-animation">
                   <CheckCircle size={64} color="var(--color-tertiary)" />
                 </div>
                 <h3>Payment Successful</h3>
                 <p>Your receipt has been sent to your registered mobile number.</p>
                 <button className="btn-outline-dark" onClick={onClose}>Close Window</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (service.title === 'Register Grievance') {
      return (
        <div className="modal-feature-form">
           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div key="g-step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h3>New Grievance</h3>
                  <div className="form-group">
                    <select>
                      <option>Select Category</option>
                      <option>Street Light Issue</option>
                      <option>Water Supply</option>
                      <option>Road Maintenance</option>
                      <option>Garbage Collection</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <textarea rows="3" placeholder="Describe your issue..."></textarea>
                  </div>
                  <div className="form-group upload-btn">
                    <Upload size={16} /> <span>Attach Photo (Optional)</span>
                  </div>
                  <button className="btn-pay" onClick={handleAction} disabled={loading}>
                    {loading ? <div className="spinner"></div> : <><Send size={16} style={{marginRight: '8px'}}/> Submit Grievance</>}
                  </button>
               </motion.div>
             )}
             {step === 2 && (
               <motion.div key="g-step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-view">
                 <CheckCircle size={64} color="var(--color-tertiary)" />
                 <h3>Grievance Registered</h3>
                 <p>Ticket ID: <strong>#GRV-84920</strong></p>
                 <p className="text-sm">Our AI system has assigned this to the relevant department. You will receive SMS updates.</p>
                 <button className="btn-outline-dark" onClick={onClose} style={{marginTop: '1rem'}}>Done</button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      )
    }

    if (service.title.toLowerCase().includes('certificate')) {
      return (
        <div className="modal-feature-form">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="cert-step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>Apply for Certificate</h3>
                <div className="form-group">
                  <select>
                    <option>Select Certificate Type</option>
                    <option>Birth Certificate</option>
                    <option>Death Certificate</option>
                    <option>Marriage Certificate</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Applicant Full Name" />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Registration ID / Hospital Reference No." />
                </div>
                <button className="btn-pay" onClick={handleAction} disabled={loading}>
                  {loading ? <div className="spinner"></div> : <><Send size={16} style={{marginRight: '8px'}}/> Submit Application</>}
                </button>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="cert-step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-view">
                <CheckCircle size={64} color="var(--color-tertiary)" />
                <h3>Application Submitted</h3>
                <p>Application ID: <strong>#CERT-2026-981</strong></p>
                <p className="text-sm">Your application has been routed to the Registrar for digital approval.</p>
                <button className="btn-outline-dark" onClick={onClose} style={{marginTop: '1rem'}}>Close Window</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="modal-feature-form">
         <h3>{service.title} Portal</h3>
         <p>Select an option to interact with the {service.title} system.</p>
         <button className="btn-pay" onClick={handleAction} disabled={loading}>
           {loading ? <div className="spinner"></div> : 'Proceed'}
         </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop">
          <motion.div 
            className="modal-backdrop-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            className="modal-content-wrapper"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
            
            <div className="modal-layout">
              <div className="modal-sidebar" style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}aa)` }}>
                <div className="modal-icon-large">
                  {service.icon}
                </div>
                <h2>{service.title}</h2>
                <p>{service.desc}</p>
                
                <div className="modal-features">
                  <div className="feature-item"><CheckCircle size={14}/> Instant Processing</div>
                  <div className="feature-item"><CheckCircle size={14}/> Highly Secure</div>
                </div>
              </div>
              
              <div className="modal-body">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal;
