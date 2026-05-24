'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { showToast } from '@/components/Toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Form States
  const [settings, setSettings] = useState({
    panelName: 'PeakSender',
    currency: 'USD ($)',
    maintenance: false,
    timezone: '(GMT+05:30) Mumbai, Kolkata',
    apiUrl: 'https://theroyalsmm.com/api/v2',
    apiKey: '',
    razorpayKey: '',
    razorpaySecret: '',
    paytmMid: '',
    paytmKey: '',
    phonepeUpiId: 'paytm.slay1so@pty',
    phonepeMerchantName: 'PUSHPA',
    usdToInr: '83',
    minDeposit: '10', // Minimum payment amount in INR
    metaTitle: 'PeakSender | Best SMM Panel',
    metaDesc: 'Boost your social media presence instantly.',
    waNumber: '+91 1234567890',
    supportEmail: 'support@peaksender.com',
  });

  // Load settings from localStorage on mount asynchronously
  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      setTimeout(() => {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }, 0);
    }
  }, []);

  // Tab change instructions
  useEffect(() => {
    if (activeTab === 'payment') {
      showToast('info', 'Instruction: Setting the minimum deposit here dynamically enforces input limits on the user Add Funds page.');
    }
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      setIsSaving(false);
      
      const successMsg = 'Settings saved successfully!';
      setSaveStatus(successMsg);
      showToast('success', successMsg);
      
      setTimeout(() => setSaveStatus(''), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'provider', label: 'SMM Provider', icon: '🔗' },
    { id: 'payment', label: 'Payments', icon: '💰' },
    { id: 'seo', label: 'SEO & Meta', icon: '🔍' },
    { id: 'support', label: 'Support', icon: '🎧' },
  ];

  return (
    <div className={styles.settingsPage}>
      <header className={styles.settingsHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>System Settings</h2>
            <p>Configure your panel&apos;s global behavior and integrations.</p>
          </div>
          {saveStatus && <div className={styles.saveBadge}>{saveStatus}</div>}
        </div>
      </header>

      <div className={styles.settingsGrid}>
        {/* Sidebar Tabs */}
        <aside className={styles.settingsTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className={`${styles.settingsContent} glass`}>
          {activeTab === 'general' && (
            <div className="animate-fade">
              <h3>General Configuration</h3>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Panel Name</label>
                  <input name="panelName" type="text" value={settings.panelName} onChange={handleChange} className="glass" />
                </div>
                <div className={styles.field}>
                  <label>Currency Code</label>
                  <select name="currency" value={settings.currency} onChange={handleChange} className="glass">
                    <option>USD ($)</option>
                    <option>INR (₹)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Maintenance Mode</label>
                  <div className={styles.toggle}>
                    <input name="maintenance" type="checkbox" id="maintenance" checked={settings.maintenance} onChange={handleChange} />
                    <label htmlFor="maintenance"></label>
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem' }}>Enable (Site will be offline)</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Timezone</label>
                  <select name="timezone" value={settings.timezone} onChange={handleChange} className="glass">
                    <option>(GMT+05:30) Mumbai, Kolkata</option>
                    <option>(GMT+00:00) London</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'provider' && (
            <div className="animate-fade">
              <h3>SMM Provider API</h3>
              <div className={styles.field}>
                <label>API URL</label>
                <input name="apiUrl" type="text" value={settings.apiUrl} onChange={handleChange} className="glass" />
              </div>
              <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                <label>API Key</label>
                <input name="apiKey" type="password" value={settings.apiKey} onChange={handleChange} className="glass" />
              </div>
              <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                <label>USD to INR Conversion Rate (₹)</label>
                <input name="usdToInr" type="number" value={settings.usdToInr} onChange={handleChange} className="glass" />
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  * Current rate used for auto-fill conversion (e.g. 83).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="animate-fade">
              <h3>Payment Gateways</h3>
              <div className={styles.gatewayCard}>
                <h4>Razorpay (India)</h4>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Key ID</label>
                  <input name="razorpayKey" type="text" value={settings.razorpayKey} onChange={handleChange} className="glass" />
                </div>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Key Secret</label>
                  <input name="razorpaySecret" type="password" value={settings.razorpaySecret} onChange={handleChange} className="glass" />
                </div>
              </div>

              <div className={styles.gatewayCard} style={{ marginTop: '2rem' }}>
                <h4>Paytm (India)</h4>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Merchant ID</label>
                  <input name="paytmMid" type="text" value={settings.paytmMid || ''} onChange={handleChange} className="glass" />
                </div>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Merchant Key</label>
                  <input name="paytmKey" type="password" value={settings.paytmKey || ''} onChange={handleChange} className="glass" />
                </div>
              </div>

              <div className={styles.gatewayCard} style={{ marginTop: '2rem' }}>
                <h4>PhonePe QR Settings</h4>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Merchant UPI ID (for QR)</label>
                  <input name="phonepeUpiId" type="text" value={settings.phonepeUpiId} onChange={handleChange} className="glass" />
                </div>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Display Name (Merchant Name)</label>
                  <input name="phonepeMerchantName" type="text" value={settings.phonepeMerchantName} onChange={handleChange} className="glass" />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                  * This UPI ID will be used to generate the QR code automatically on the Add Funds page.
                </p>
              </div>

              <div className={styles.gatewayCard} style={{ marginTop: '2rem' }}>
                <h4>Deposit Limits</h4>
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label>Minimum Deposit Amount (₹)</label>
                  <input name="minDeposit" type="number" value={settings.minDeposit || '10'} onChange={handleChange} className="glass" min="1" />
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    * Minimum payment amount a user must pay to submit a receipt (default: ₹10).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="animate-fade">
              <h3>Search Engine Optimization</h3>
              <div className={styles.field}>
                <label>Meta Title</label>
                <input name="metaTitle" type="text" value={settings.metaTitle} onChange={handleChange} className="glass" />
              </div>
              <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                <label>Meta Description</label>
                <textarea name="metaDesc" rows={4} value={settings.metaDesc} onChange={handleChange} className="glass"></textarea>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="animate-fade">
              <h3>Support Channels</h3>
              <div className={styles.field}>
                <label>WhatsApp Number</label>
                <input name="waNumber" type="text" value={settings.waNumber} onChange={handleChange} className="glass" />
              </div>
              <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                <label>Support Email</label>
                <input name="supportEmail" type="email" value={settings.supportEmail} onChange={handleChange} className="glass" />
              </div>
            </div>
          )}
          
          <div className={styles.settingsFooter}>
            <button 
              className={styles.actionBtn} 
              style={{ background: '#ef4444', width: '100%' }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
