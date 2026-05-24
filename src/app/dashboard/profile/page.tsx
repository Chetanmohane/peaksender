'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

const ProfileSettingsPage = () => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load profile asynchronously
    const saved = localStorage.getItem('peaksender_profile');
    if (saved) {
      setTimeout(() => {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setName(parsed.name);
          if (parsed.email) setEmail(parsed.email);
        } catch (e) {
          console.error(e);
        }
      }, 0);
    }
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const profile = { name, email };
        localStorage.setItem('peaksender_profile', JSON.stringify(profile));
        
        const successMsg = 'Profile details updated successfully!';
        setMessage({ type: 'success', text: successMsg });
        showToast('success', successMsg);
        
        // Dispatch custom update event for layout header
        window.dispatchEvent(new Event('peaksender_profile_update'));
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to update profile.';
        setMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      const errMsg = 'Please fill all password fields.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const errMsg = 'New passwords do not match.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const successMsg = 'Password reset successfully!';
      setMessage({ type: 'success', text: successMsg });
      showToast('success', successMsg);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        {/* Profile Details Card */}
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>Account Settings</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Update your personal profile information and contact details.
          </p>

          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleUpdateProfile}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input 
                type="text" 
                className="glass" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <input 
                type="email" 
                className="glass" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Password Overhaul Form */}
          <hr className={styles.divider} style={{ margin: '3rem 0', opacity: 0.1 }} />

          <h2>Change Password</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Ensure your account is secure by changing your password periodically.
          </p>

          <form className={styles.orderForm} onSubmit={handleUpdatePassword}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="glass" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="glass" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="glass" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account Meta Side Column */}
        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`}>
            <h3>VIP Status Level</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tier:</span>
                <span className={styles.statusBadge} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  VIP Elite
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Discount Rate:</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>5.0% flat</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Support Priority:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>VIP Ticket Lane</span>
              </div>
            </div>
            <hr className={styles.divider} style={{ margin: '1.5rem 0', opacity: 0.05 }} />
            <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem' }}>VIP Perks Details</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              As a PeakSender VIP Elite member, you receive premium discounts on bulk orders, automatic API-keys access, and instantaneous support response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
