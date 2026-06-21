'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

type Deposit = {
  id: string;
  method: string;
  amount: number;
  transactionId: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
};

const AddFundsPage = () => {
  const [amount, setAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState('');
  const [balance, setBalance] = useState<number>(0.00);
  const [recentDeposits, setRecentDeposits] = useState<Deposit[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [minDeposit, setMinDeposit] = useState<number>(10);

  const [upiId, setUpiId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  // Generate QR code when upiId or amount changes
  useEffect(() => {
    if (!upiId) return;
    const uri = `upi://pay?pa=${upiId}&am=${amount}`;
    QRCode.toDataURL(uri)
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error', err));
  }, [upiId, amount]);
  useEffect(() => {
    // Load Admin Settings & Min Deposit
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.minDeposit) {
          const min = parseFloat(parsed.minDeposit);
          setMinDeposit(min);
          setAmount(min);
        }
        if (parsed.phonepeUpiId) {
          const upi = parsed.phonepeUpiId;
          setUpiId(upi);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedBalance = localStorage.getItem('peaksender_balance');
    if (savedBalance) {
      setTimeout(() => {
        setBalance(parseFloat(savedBalance));
      }, 0);
    }

    // Fetch live user balance from DB
    setTimeout(() => {
      const profileStr = localStorage.getItem('peaksender_profile');
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.name) {
            fetch(`/api/user/stats?username=${encodeURIComponent(profile.name)}`)
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  localStorage.setItem('peaksender_balance', data.balance.toString());
                  setBalance(data.balance);
                  window.dispatchEvent(new Event('peaksender_balance_update'));
                }
              })
              .catch(err => console.error('Failed to fetch user stats on add-funds load:', err));
          }
        } catch (e) {}
      }
    }, 0);

    // Load Recent Deposits
    const savedDeposits = localStorage.getItem('peaksender_deposits');
    if (savedDeposits) {
      setTimeout(() => {
        try {
          setRecentDeposits(JSON.parse(savedDeposits));
        } catch (e) {
          console.error(e);
        }
      }, 0);
    } else {
      const defaultDeposits: Deposit[] = [
        { id: 'DEP-1023', method: 'Trio UPI QR', amount: 500.00, transactionId: '412398471928', date: '2026-05-18 14:32', status: 'Completed' },
        { id: 'DEP-1024', method: 'Trio UPI QR', amount: 250.00, transactionId: '412309124817', date: '2026-05-19 19:12', status: 'Completed' }
      ];
      localStorage.setItem('peaksender_deposits', JSON.stringify(defaultDeposits));
      setTimeout(() => {
        setRecentDeposits(defaultDeposits);
      }, 0);
    }

    const handleBalanceUpdate = () => {
      const currentBalance = localStorage.getItem('peaksender_balance');
      if (currentBalance) setBalance(parseFloat(currentBalance));
      
      const currentDeposits = localStorage.getItem('peaksender_deposits');
      if (currentDeposits) {
        try {
          setRecentDeposits(JSON.parse(currentDeposits));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('peaksender_balance_update', handleBalanceUpdate);
    window.addEventListener('peaksender_deposits_update', handleBalanceUpdate);

    // Mount instruction toast
    showToast('info', 'Instruction: Scan the UPI QR, pay the amount, and copy the 12-digit UTR Transaction ID to verify your deposit.');

    return () => {
      window.removeEventListener('peaksender_balance_update', handleBalanceUpdate);
      window.removeEventListener('peaksender_deposits_update', handleBalanceUpdate);
    };
  }, []);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (amount !== minDeposit) {
      const errMsg = `Payment amount must be exactly ₹${minDeposit.toFixed(2)}.`;
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    const cleanUtr = transactionId.trim();
    if (!cleanUtr) {
      const errMsg = 'Please enter your 12-digit UTR Number.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    if (cleanUtr.length !== 12) {
      const errMsg = 'Please enter a valid 12-digit UPI UTR Number.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const depId = 'DEP-' + Math.floor(1000 + Math.random() * 9000);

    const newDeposit: Deposit = {
      id: depId,
      method: 'Trio UPI QR',
      amount: parseFloat(amount.toFixed(2)),
      transactionId: cleanUtr,
      date: dateStr,
      status: 'Pending'
    };

    const updatedDeposits = [newDeposit, ...recentDeposits];
    localStorage.setItem('peaksender_deposits', JSON.stringify(updatedDeposits));
    setRecentDeposits(updatedDeposits);

    setAmount(0);
    setTransactionId('');
    
    const successMsg = `Receipt submitted! UTR #${cleanUtr} has been sent to Admin for approval. Balance will credit within minutes once verified.`;
    setMessage({ 
      type: 'success', 
      text: successMsg 
    });
    showToast('success', successMsg);

    window.dispatchEvent(new Event('peaksender_deposits_update'));
  };

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Add Funds</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Current Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>Secure UPI QR Deposit</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Scan the Trio QR Code using any UPI App (PhonePe, GooglePay, Paytm, BHIM) and pay. Submit the UTR transaction receipt below for instant credit verification.
          </p>
          
          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handlePayment}>
            {/* Display Trio QR Image */}
            <div className={styles.qrContainer} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', width: '300px', height: '300px', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={qrDataUrl || '/payment-qr.png'} 
                  alt="Trio UPI QR Code" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: 'var(--foreground)', display: 'block', fontSize: '1rem' }}>Scan to Pay via UPI</strong>
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>BHIM / GPay / PhonePe / Paytm</span>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Minimum payment amount is ₹{minDeposit}.</p>

            <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
              <label>Amount paid (INR ₹)</label>
              <input 
                type="number" 
                placeholder={`Enter paid amount (Min ₹${minDeposit})`}
                className="glass"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
                min={minDeposit} max={minDeposit}
              />
            </div>

            <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
              <label>UTR Number / Transaction ID</label>
              <input 
                type="text" 
                placeholder="12-digit UPI UTR e.g. 4123XXXXXXXX" 
                className="glass"
                value={transactionId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setTransactionId(val);
                }}
                required
                maxLength={12}
              />
              <p style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                * Copy the 12-digit Ref No / UTR from your PhonePe, GPay, or Paytm transaction receipt.
              </p>
            </div>

            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              style={{ marginTop: '1rem', background: 'var(--gradient-primary)' }}
            >
              Submit Payment Receipt
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2rem', opacity: 0.7 }}>
              &quot;1% Of The Revenue Goes To Help Cows & Poor People with School Fees, Food&quot;
            </p>
          </form>
        </div>

        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`}>
            <h3>How to Pay?</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.8' }}>
              <p>1. Scan the BHIM Trio QR Code on the left using your UPI App.</p>
              <p>2. Enter your payment amount and enter UPI PIN to complete payment.</p>
              <p>3. Go to transaction history, copy the <strong>12-digit UTR/Ref No</strong>.</p>
              <p>4. Enter the same paid Amount and UTR No in the form and submit.</p>
              <p>5. Admin will verify your UTR and credit your balance within minutes.</p>
            </div>
          </div>
          
          <div className={`${styles.infoCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
            <h3>Recent Deposits</h3>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              {recentDeposits.map((dep, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: '500' }}>₹{dep.amount.toFixed(2)}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UTR: {dep.transactionId}</span>
                    <br />
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{dep.date}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${
                    dep.status === 'Completed' ? styles.completed : dep.status === 'Pending' ? styles.pending : styles.canceled
                  }`} style={{ fontSize: '0.7rem', height: 'fit-content' }}>
                    {dep.status}
                  </span>
                </div>
              ))}
              {recentDeposits.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>No recent deposits found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFundsPage;
