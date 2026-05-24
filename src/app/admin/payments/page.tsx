'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { showToast } from '@/components/Toast';

type Deposit = {
  id: string;
  method: string;
  amount: number;
  transactionId: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
};

const AdminPayments = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(8450.00);

  // Load deposits from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('peaksender_deposits');
    if (saved) {
      setTimeout(() => {
        try {
          const parsed = JSON.parse(saved);
          setDeposits(parsed);
          
          // Calculate total completed revenue
          const total = parsed
            .filter((d: Deposit) => d.status === 'Completed')
            .reduce((sum: number, d: Deposit) => sum + d.amount, 0);
          setTotalRevenue(total || 8450.00);
        } catch (e) {
          console.error(e);
        }
      }, 0);
    }
  }, []);

  const handleApprove = (depId: string) => {
    const saved = localStorage.getItem('peaksender_deposits');
    if (!saved) return;

    try {
      const allDeps: Deposit[] = JSON.parse(saved);
      const targetDep = allDeps.find(d => d.id === depId);

      if (!targetDep || targetDep.status !== 'Pending') return;

      // Update Status
      targetDep.status = 'Completed';

      // Credit User Balance
      const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '12500.00');
      const updatedBalance = currentBalance + targetDep.amount;
      localStorage.setItem('peaksender_balance', updatedBalance.toString());

      // Save back to LocalStorage
      localStorage.setItem('peaksender_deposits', JSON.stringify(allDeps));
      setDeposits(allDeps);

      // Recalculate total completed revenue
      const total = allDeps
         .filter(d => d.status === 'Completed')
         .reduce((sum, d) => sum + d.amount, 0);
      setTotalRevenue(total || 8450.00);

      showToast('success', `Deposit request ${depId} approved successfully! ₹${targetDep.amount.toFixed(2)} credited to balance.`);
      
      // Dispatch sync events
      window.dispatchEvent(new Event('peaksender_balance_update'));
      window.dispatchEvent(new Event('peaksender_deposits_update'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = (depId: string) => {
    const saved = localStorage.getItem('peaksender_deposits');
    if (!saved) return;

    try {
      const allDeps: Deposit[] = JSON.parse(saved);
      const targetDep = allDeps.find(d => d.id === depId);

      if (!targetDep || targetDep.status !== 'Pending') return;

      // Update Status
      targetDep.status = 'Rejected';

      // Save back to LocalStorage
      localStorage.setItem('peaksender_deposits', JSON.stringify(allDeps));
      setDeposits(allDeps);

      showToast('info', `Deposit request ${depId} rejected.`);
      
      // Dispatch sync events
      window.dispatchEvent(new Event('peaksender_deposits_update'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddManualCredit = () => {
    const amountStr = prompt('Enter the amount (₹) to credit manually to the user:');
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Please enter a valid positive number.');
      return;
    }

    const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '12500.00');
    const updatedBalance = currentBalance + amount;
    localStorage.setItem('peaksender_balance', updatedBalance.toString());

    showToast('success', `Successfully credited ₹${amount.toFixed(2)} to user balance manually.`);

    // Dispatch balance update event
    window.dispatchEvent(new Event('peaksender_balance_update'));
  };

  const pendingCount = deposits.filter(d => d.status === 'Pending').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>Payment Logs & Deposits</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.actionBtn}>Export CSV</button>
          <button 
            className={styles.actionBtn} 
            style={{ background: '#10b981' }}
            onClick={handleAddManualCredit}
          >
            Add Manual Credit
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <label>Total Deposits (₹)</label>
          <h2>₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <div className={styles.statCard}>
          <label>Pending Verification</label>
          <h2 style={{ color: '#f59e0b' }}>{pendingCount}</h2>
        </div>
        <div className={styles.statCard}>
          <label>Today&apos;s Volume</label>
          <h2>₹{totalRevenue > 0 ? (totalRevenue * 0.15).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '₹1,200.00'}</h2>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Method</th>
              <th>Transaction ID / UTR</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep) => (
              <tr key={dep.id}>
                <td className={styles.idCol}>{dep.id}</td>
                <td>{dep.method}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{dep.transactionId}</td>
                <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{dep.amount.toFixed(2)}</td>
                <td>
                  <span className={`${styles.status} ${
                    dep.status === 'Completed' ? styles.success : dep.status === 'Pending' ? styles.warning : styles.danger
                  }`}>
                    {dep.status}
                  </span>
                </td>
                <td>{dep.date}</td>
                <td>
                  {dep.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={styles.actionBtn} 
                        style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                        onClick={() => handleApprove(dep.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleReject(dep.id)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified</span>
                  )}
                </td>
              </tr>
            ))}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  No deposits requested yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
