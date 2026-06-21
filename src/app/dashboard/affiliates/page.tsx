'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

type Payout = {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Rejected';
};

const AffiliatesPage = () => {
  const [earnings, setEarnings] = useState<number>(2450.00);
  const referrals = 48;
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [copyText, setCopyText] = useState('Copy Link');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load earnings
    const savedEarnings = localStorage.getItem('peaksender_affiliate_earnings');
    if (savedEarnings) {
      setTimeout(() => {
        setEarnings(parseFloat(savedEarnings));
      }, 0);
    } else {
      localStorage.setItem('peaksender_affiliate_earnings', '2450.00');
    }

    // Load payouts history
    const savedPayouts = localStorage.getItem('peaksender_payouts');
    if (savedPayouts) {
      setTimeout(() => {
        try {
          setPayouts(JSON.parse(savedPayouts));
        } catch (e) {
          console.error(e);
        }
      }, 0);
    } else {
      const defaultPayouts: Payout[] = [
        { id: 'PAY-1123', date: '2026-04-15 11:20', amount: 1200.00, status: 'Paid' },
        { id: 'PAY-1502', date: '2026-05-01 16:45', amount: 1250.00, status: 'Pending' }
      ];
      localStorage.setItem('peaksender_payouts', JSON.stringify(defaultPayouts));
      setTimeout(() => {
        setPayouts(defaultPayouts);
      }, 0);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://thepeaksmm.shop/ref/thepeaksmm123");
    setCopyText('Copied! ✓');
    showToast('success', 'Referral link copied to clipboard!');
    setTimeout(() => {
      setCopyText('Copy Link');
    }, 2000);
  };

  const handleRequestPayout = () => {
    setMessage(null);

    if (earnings < 1000.00) {
      const errMsg = 'Minimum payout threshold is ₹1,000.00.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    try {
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
      const payoutId = 'PAY-' + Math.floor(1000 + Math.random() * 9000);

      const newPayout: Payout = {
        id: payoutId,
        date: dateStr,
        amount: earnings,
        status: 'Pending'
      };

      const updatedPayouts = [newPayout, ...payouts];
      localStorage.setItem('peaksender_payouts', JSON.stringify(updatedPayouts));
      setPayouts(updatedPayouts);

      // Deduct earnings
      localStorage.setItem('peaksender_affiliate_earnings', '0.00');
      setEarnings(0.00);

      const successMsg = `Payout request #${payoutId} for ₹${newPayout.amount.toFixed(2)} submitted successfully!`;
      setMessage({ type: 'success', text: successMsg });
      showToast('success', successMsg);
    } catch (e) {
      console.error(e);
      const errMsg = 'Failed to request payout.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass animate-fade`}>
          <label>Total Earnings</label>
          <h3 className="text-gradient">₹{earnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className={`${styles.statCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
          <label>Total Referrals</label>
          <h3>{referrals}</h3>
        </div>
        <div className={`${styles.statCard} glass animate-fade`} style={{ animationDelay: '0.2s' }}>
          <label>Min Payout</label>
          <h3>₹1,000.00</h3>
        </div>
      </div>

      <div className={`${styles.orderCard} glass animate-fade`} style={{ marginTop: '2rem' }}>
        <h2>Affiliate Program</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Earn <strong>5% commission</strong> for every deposit your referrals make! Share your unique referral link below and watch your earnings grow.
        </p>

        {message && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
          <label>Your Referral Link</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              readOnly 
              value="https://thepeaksmm.shop/ref/thepeaksmm123" 
              className="glass" 
              style={{ flex: 1, padding: '1rem', color: 'var(--foreground)', minWidth: '250px' }} 
            />
            <button 
              type="button"
              className={styles.placeOrderBtn}
              onClick={handleCopyLink}
              style={{ width: 'auto', padding: '0 2rem' }}
            >
              {copyText}
            </button>
          </div>
        </div>

        <button
          onClick={handleRequestPayout}
          className={styles.placeOrderBtn}
          style={{ width: 'auto', padding: '0.8rem 2.5rem', marginTop: '1rem', background: 'var(--gradient-primary)' }}
          disabled={earnings < 1000.00}
        >
          Request Payout (UPI / Paytm / Bank)
        </button>

        <div className={`${styles.tableWrapper} glass`} style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', padding: '0 1rem' }}>Payout History</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((pay, i) => (
                <tr key={i}>
                  <td className={styles.idCol}>{pay.id}</td>
                  <td>{pay.date}</td>
                  <td className={styles.value}>₹{pay.amount.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[pay.status.toLowerCase()]}`}>
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payouts requested yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;
