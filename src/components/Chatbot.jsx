import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! I am Nagar Mitra, your AI Smart City Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "I have registered your query. Our team will look into this shortly. For urgent matters, please use the 'Register Grievance' portal.";
      
      const lowerInput = newUserMsg.text.toLowerCase();
      if (lowerInput.includes('tax')) {
        botResponse = "To pay property tax, please go to the 'Services' tab and click on 'Property Tax'. You will need your Property ID.";
      } else if (lowerInput.includes('water')) {
        botResponse = "Water supply details can be found under 'Water Bill Payment'. Current disruption in Ward 4 will be resolved by 5 PM.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = "Hello! Welcome to the digital portal. What service are you looking for today?";
      }

      setMessages(prev => [...prev, { id: Date.now(), text: botResponse, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button — Government Style */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #002060 0%, #003580 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,53,128,0.4)',
          zIndex: 999,
          transition: 'all 0.2s ease',
          border: '2px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          fontSize: '1.6rem',
          lineHeight: 1
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,53,128,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,53,128,0.4)'; }}
        title="Nagar Mitra — AI Assistant"
      >
        🏛️
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '14px',
          height: '14px',
          background: '#FF6200',
          borderRadius: '50%',
          border: '2px solid white',
          animation: 'ping-dot 1.5s infinite'
        }}></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="chatbot-header">
              <div className="flex items-center gap-3">
                <div className="bot-avatar" style={{ fontSize: '1.1rem' }}>🤖</div>
                <div>
                  <h4 style={{ margin: 0, color: 'white', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nagar Mitra AI</h4>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🟢 Online — Official Government Assistant</span>
                </div>
              </div>
              <button className="close-chat" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                  {msg.sender === 'bot' && <div className="msg-icon"><Bot size={14} /></div>}
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && <div className="msg-icon user"><User size={14} /></div>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
