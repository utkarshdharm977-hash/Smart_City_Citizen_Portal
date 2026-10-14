import React, { useState } from 'react';
import { Settings2, Type, SunMoon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Accessibility.css';

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  };

  const changeFontSize = (delta) => {
    const newSize = Math.max(14, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  return (
    <div className="accessibility-wrapper">
      <button className="acc-toggle-btn" onClick={() => setIsOpen(!isOpen)} title="Accessibility Settings">
        <Settings2 size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="acc-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h4>Accessibility</h4>
            
            <div className="acc-control">
              <span><Type size={16} className="mr-2"/> Text Size</span>
              <div className="acc-actions">
                <button onClick={() => changeFontSize(-2)}>A-</button>
                <button onClick={() => changeFontSize(2)}>A+</button>
              </div>
            </div>

            <div className="acc-control">
              <span><SunMoon size={16} className="mr-2"/> Contrast</span>
              <div className="acc-actions">
                <button className={highContrast ? 'active' : ''} onClick={toggleContrast}>
                  Toggle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilityWidget;
