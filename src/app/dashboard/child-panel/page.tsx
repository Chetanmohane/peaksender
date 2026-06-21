'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

type ChildPanel = {
  domain: string;
  currency: string;
  adminUser: string;
  createdAt: string;
  status: 'Setting up DNS' | 'Active' | 'Expired';
};

const ChildPanelPage = () => {
  const [domain, setDomain] = useState('');
  const [currency, setCurrency] = useState('INR - Indian Rupee');
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [balance, setBalance] = useState<number>(0.00);
  const [childPanels, setChildPanels] = useState<ChildPanel[]>([]);

  useEffect(() => {
    // Load balance
    const savedBalance = localStorage.getItem('peaksender_balance');
    if (savedBalance) {
      setTimeout(() => {
        setBalance(parseFloat(savedBalance));
      }, 0);
    }

    // Load child panels
    const savedPanels = localStorage.getItem('peaksender_child_panels');
    if (savedPanels) {
      setTimeout(() => {
        try {
          setChildPanels(JSON.parse(savedPanels));
        } catch (e) {
          console.error(e);
        }
      }, 0);
    }

    const handleBalanceUpdate = () => {
      const currentBalance = localStorage.getItem('peaksender_balance');
      if (currentBalance) setBalance(parseFloat(currentBalance));
    };

    window.addEventListener('peaksender_balance_update', handleBalanceUpdate);

    // Mount instruction toast
    showToast('info', 'Instruction: Point your domain DNS nameservers to ns1.thepeaksmm.shop and ns2.thepeaksmm.shop before purchase.');

    return () => {
      window.removeEventListener('peaksender_balance_update', handleBalanceUpdate);
    };
  }, []);

  const handleBuyPanel = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!domain || !adminUser || !adminPassword) {
      const errMsg = 'Please fill all fields correctly.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    const price = 2075.00; // $25 in INR
    const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '0.00');

    if (currentBalance < price) {
      const errMsg = `Insufficient balance! Child Panel rent is ₹${price.toFixed(2)} (approx. $25) but your balance is ₹${currentBalance.toFixed(2)}. Please Add Funds.`;
      setMessage({ 
        type: 'error', 
        text: errMsg 
      });
      showToast('error', errMsg);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const newBalance = currentBalance - price;
        localStorage.setItem('peaksender_balance', newBalance.toString());

        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

        const newPanel: ChildPanel = {
          domain,
          currency,
          adminUser,
          createdAt: dateStr,
          status: 'Setting up DNS'
        };

        const updatedPanels = [newPanel, ...childPanels];
        localStorage.setItem('peaksender_child_panels', JSON.stringify(updatedPanels));
        setChildPanels(updatedPanels);

        // Reset
        setDomain('');
        setAdminUser('');
        setAdminPassword('');

        const successMsg = `Child Panel for ${domain} ordered successfully! ₹2,075.00 rent deducted.`;
        setMessage({ type: 'success', text: successMsg });
        showToast('success', successMsg);

        // Dispatch
        window.dispatchEvent(new Event('peaksender_balance_update'));
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to order child panel.';
        setMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Child Panel</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Current Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>Get Your Own SMM Panel</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Rent your own white-label SMM panel and start your own business today. 
            Everything is automated and ready to go.
          </p>
          
          <div className={`${styles.infoCard} glass`} style={{ marginBottom: '2rem', border: '1px solid var(--accent)', background: 'rgba(61, 90, 254, 0.05)' }}>
            <h3 style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>Pricing: <span className="text-gradient">₹2,075.00 / Monthly</span></h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Includes all imported services, automated rate updates, and 24/7 technical support.</p>
          </div>

          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleBuyPanel}>
            <div className={styles.field}>
              <label>Domain Name</label>
              <input 
                type="text" 
                placeholder="example.com" 
                className="glass"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Currency</label>
              <select 
                className="glass"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
              >
                <option value="INR - Indian Rupee">INR - Indian Rupee</option>
                <option value="USD - US Dollar">USD - US Dollar</option>
                <option value="EUR - Euro">EUR - Euro</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Admin Username</label>
              <input 
                type="text" 
                placeholder="admin" 
                className="glass"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Admin Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="glass"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className={`${styles.priceSummary} glass`}>
              <div className={styles.priceRow}>
                <span>Monthly Rent Charge:</span>
                <span>₹2,075.00</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Processing Order...' : 'Buy Child Panel'}
            </button>
          </form>
        </div>

        {/* Dynamic Panels Setup List */}
        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`}>
            <h3>Nameserver Instructions</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.8' }}>
              <p>In order to set up your domain, you must configure your domain&apos;s DNS nameservers to:</p>
              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', margin: '0.8rem 0', fontFamily: 'monospace', color: 'var(--foreground)' }}>
                <p>ns1.thepeaksmm.shop</p>
                <p>ns2.thepeaksmm.shop</p>
              </div>
              <p>DNS propagation can take up to 24-48 hours to fully activate globally.</p>
            </div>
          </div>

          <div className={`${styles.infoCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
            <h3>Your Rented SMM Panels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {childPanels.map((panel, idx) => (
                <div key={idx} style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--card-border)',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--foreground)', fontWeight: 'bold', fontSize: '0.9rem' }}>{panel.domain}</span>
                    <span className={`${styles.statusBadge} ${styles.pending}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                      {panel.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <p>Currency: {panel.currency}</p>
                    <p>Admin: {panel.adminUser}</p>
                    <p>Ordered on: {panel.createdAt}</p>
                  </div>
                </div>
              ))}
              {childPanels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>You don&apos;t have any child panels rented yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildPanelPage;
