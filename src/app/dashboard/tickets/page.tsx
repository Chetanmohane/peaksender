'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  orderId?: string;
  message: string;
  status: 'Pending' | 'Resolved' | 'Customer Reply';
  createdAt: string;
};

const TicketsPage = () => {
  const [category, setCategory] = useState('Order');
  const [subject, setSubject] = useState('Refill');
  const [orderId, setOrderId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const loadTickets = () => {
      const savedTickets = localStorage.getItem('peaksender_tickets');
      if (savedTickets) {
        setTimeout(() => {
          try {
            setTickets(JSON.parse(savedTickets));
          } catch (e) {
            console.error(e);
          }
        }, 0);
      } else {
        const defaultTickets: SupportTicket[] = [
          {
            id: '#T-1245',
            category: 'Payment',
            subject: 'Add Funds issue',
            orderId: '',
            message: 'QR code was paid but balance did not add automatically.',
            status: 'Resolved',
            createdAt: '2026-05-18 14:32'
          },
          {
            id: '#T-1192',
            category: 'Order',
            subject: 'Refill',
            orderId: 'ORD-7721',
            message: 'Followers dropped, please refill.',
            status: 'Pending',
            createdAt: '2026-05-20 10:15'
          }
        ];
        localStorage.setItem('peaksender_tickets', JSON.stringify(defaultTickets));
        setTimeout(() => {
          setTickets(defaultTickets);
        }, 0);
      }
    };
    
    loadTickets();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_tickets') loadTickets();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!messageText) {
      const errMsg = 'Please explain your issue in the message field.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
        const ticketId = '#T-' + Math.floor(1000 + Math.random() * 9000);

        const newTicket: SupportTicket = {
          id: ticketId,
          category,
          subject,
          orderId: orderId || undefined,
          message: messageText,
          status: 'Pending',
          createdAt: dateStr
        };

        const updatedTickets = [newTicket, ...tickets];
        localStorage.setItem('peaksender_tickets', JSON.stringify(updatedTickets));
        setTickets(updatedTickets);

        // Reset
        setOrderId('');
        setMessageText('');

        const successMsg = `Support ticket ${ticketId} created successfully! Support team will review it.`;
        setMessage({ type: 'success', text: successMsg });
        showToast('success', successMsg);
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to submit ticket.';
        setMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>Create New Ticket</h2>
          
          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleSubmitTicket}>
            <div className={styles.field}>
              <label>Category</label>
              <select 
                className="glass"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="Order">Order</option>
                <option value="Payment">Payment</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Subject (Sub-Category)</label>
              <select 
                className="glass"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              >
                <option value="Refill">Refill</option>
                <option value="Cancellation">Cancellation</option>
                <option value="Speed Up">Speed Up</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Order ID (Optional)</label>
              <input 
                type="text" 
                placeholder="Enter Order ID" 
                className="glass" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label>Message</label>
              <textarea 
                rows={5} 
                className="glass" 
                placeholder="Explain your issue here..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ padding: '1rem', borderRadius: '12px', color: 'var(--foreground)', border: 'none', outline: 'none' }}
                disabled={loading}
                required
              ></textarea>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Note: Use <strong>prnt.sc</strong> to upload images and paste the link here.
            </p>
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Submitting Ticket...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`}>
            <h3>Support Hours</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Our average response time is <strong>0 - 6 hours</strong>. Please wait patiently after submitting a ticket. We are available 24/7/365.
            </p>
          </div>
          <div className={`${styles.infoCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
            <h3>Ticket History</h3>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {tickets.map((t, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  paddingBottom: '0.8rem', 
                  borderBottom: idx < tickets.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: '500' }}>{t.id} - {t.category}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.subject} • {t.createdAt}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${t.status === 'Resolved' ? styles.completed : styles.pending}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                      {t.status}
                    </span>
                  </div>
                  {(t as any).adminReply && (
                    <div style={{ background: 'rgba(16,185,129,0.07)', borderRadius: '8px', padding: '0.6rem 0.8rem', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem', color: '#d1fae5' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Admin: </span>{(t as any).adminReply}
                    </div>
                  )}
                </div>
              ))}
              {tickets.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>No tickets submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
