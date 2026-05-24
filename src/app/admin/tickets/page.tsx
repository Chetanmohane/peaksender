'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { showToast } from '@/components/Toast';

type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  orderId?: string;
  message: string;
  status: 'Pending' | 'Resolved' | 'Customer Reply';
  createdAt: string;
  adminReply?: string;
};

const STATUS_CONFIG = {
  'Pending':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🕐' },
  'Resolved':      { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
  'Customer Reply':{ color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '💬' },
};

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Customer Reply'>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const loadTickets = () => {
    const saved = localStorage.getItem('peaksender_tickets');
    if (saved) {
      try { setTickets(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      const defaults: SupportTicket[] = [
        {
          id: '#T-1245', category: 'Payment', subject: 'Add Funds issue', orderId: '',
          message: 'QR code was paid but balance did not add automatically.',
          status: 'Resolved', createdAt: '2026-05-18 14:32',
          adminReply: 'We have manually added your balance. Sorry for the inconvenience!'
        },
        {
          id: '#T-1192', category: 'Order', subject: 'Refill', orderId: 'ORD-7721',
          message: 'Followers dropped, please refill.',
          status: 'Pending', createdAt: '2026-05-20 10:15'
        }
      ];
      localStorage.setItem('peaksender_tickets', JSON.stringify(defaults));
      setTickets(defaults);
    }
  };

  useEffect(() => {
    loadTickets();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_tickets') loadTickets();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('peaksender_tickets', JSON.stringify(updated));
  };

  const handleStatusChange = (id: string, newStatus: SupportTicket['status']) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus } : t);
    saveTickets(updated);
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    showToast('success', `Ticket ${id} marked as ${newStatus}`);
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) {
      showToast('error', 'Please type a reply first.');
      return;
    }
    setReplyLoading(true);
    setTimeout(() => {
      const updated = tickets.map(t =>
        t.id === selectedTicket.id
          ? { ...t, adminReply: replyText.trim(), status: 'Resolved' as const }
          : t
      );
      saveTickets(updated);
      const updatedTicket = { ...selectedTicket, adminReply: replyText.trim(), status: 'Resolved' as const };
      setSelectedTicket(updatedTicket);
      setReplyText('');
      setReplyLoading(false);
      showToast('success', 'Reply sent and ticket resolved!');
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (!confirm(`Delete ticket ${id}? This cannot be undone.`)) return;
    const updated = tickets.filter(t => t.id !== id);
    saveTickets(updated);
    if (selectedTicket?.id === id) setSelectedTicket(null);
    showToast('success', `Ticket ${id} deleted`);
  };

  const filtered = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchSearch = t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'All' || t.status === statusFilter);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Support Tickets</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {tickets.filter(t => t.status === 'Pending').length} pending · {tickets.length} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tickets..."
            className="glass"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #1e293b', minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['All', 'Pending', 'Customer Reply', 'Resolved'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              border: '1px solid',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              borderColor: statusFilter === s ? '#ef4444' : '#1e293b',
              background: statusFilter === s ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
              color: statusFilter === s ? '#ef4444' : '#94a3b8',
            }}
          >
            {s !== 'All' && STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.icon + ' '}{s}
            {s !== 'All' && (
              <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                {tickets.filter(t => t.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout: list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.2fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Ticket List */}
        <div className={styles.tableWrapper} style={{ margin: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎧</div>
              <p>No tickets found.</p>
            </div>
          ) : (
            filtered.map(ticket => {
              const cfg = STATUS_CONFIG[ticket.status];
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #1e293b',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: isSelected ? 'rgba(239,68,68,0.07)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #ef4444' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.85rem' }}>{ticket.id}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#1e293b', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{ticket.category}</span>
                      </div>
                      <p style={{ fontWeight: 600, color: 'white', margin: '0 0 0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{ticket.message}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: cfg.bg, color: cfg.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {cfg.icon} {ticket.status}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{ticket.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Detail Panel */}
        {selectedTicket && (() => {
          const cfg = STATUS_CONFIG[selectedTicket.status];
          return (
            <div className="glass" style={{ borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b', position: 'sticky', top: '1rem' }}>
              {/* Ticket Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{selectedTicket.id}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#1e293b', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{selectedTicket.category}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedTicket.subject}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.3rem 0 0' }}>{selectedTicket.createdAt}</p>
                </div>
                <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', background: cfg.bg, color: cfg.color, fontSize: '0.8rem', fontWeight: 600 }}>
                  {cfg.icon} {selectedTicket.status}
                </span>
              </div>

              {/* Order ID if exists */}
              {selectedTicket.orderId && (
                <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Linked Order: </span>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>{selectedTicket.orderId}</span>
                </div>
              )}

              {/* User Message */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Message</p>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid #1e293b', color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Admin Reply (if exists) */}
              {selectedTicket.adminReply && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Admin Reply</p>
                  <div style={{ background: 'rgba(16,185,129,0.07)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(16,185,129,0.2)', color: '#d1fae5', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    {selectedTicket.adminReply}
                  </div>
                </div>
              )}

              {/* Reply Box */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Write Reply</p>
                <textarea
                  rows={4}
                  className="glass"
                  placeholder="Type your reply to the user..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid #1e293b', resize: 'vertical', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSendReply}
                  disabled={replyLoading}
                  className={styles.submitBtn}
                  style={{ flex: '1 1 140px', height: '42px', fontSize: '0.9rem', background: '#10b981' }}
                >
                  {replyLoading ? 'Sending...' : '📨 Send Reply'}
                </button>
                <button
                  onClick={() => handleStatusChange(selectedTicket.id, selectedTicket.status === 'Resolved' ? 'Pending' : 'Resolved')}
                  className={styles.actionBtn}
                  style={{ flex: '1 1 120px', height: '42px', background: selectedTicket.status === 'Resolved' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: selectedTicket.status === 'Resolved' ? '#f59e0b' : '#10b981' }}
                >
                  {selectedTicket.status === 'Resolved' ? '🔄 Reopen' : '✅ Resolve'}
                </button>
                <button
                  onClick={() => handleDelete(selectedTicket.id)}
                  className={styles.actionBtn}
                  style={{ flex: '1 1 100px', height: '42px', background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminTicketsPage;
