'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { showToast } from '@/components/Toast';

type Service = {
  id: number;
  category: string;
  name: string;
  rate: number;
  min: number;
  max: number;
  description: string;
};

type AdminService = {
  id: number;
  name: string;
  category: string;
  rate: string;
  providerRate: string;
  originalRate: string;
  isProviderInr: boolean;
  providerId: string;
  description: string;
  status: string;
  min?: number;
  max?: number;
};

type Subscription = {
  id: string;
  categoryName: string;
  serviceName: string;
  targetLink: string;
  minQty: number;
  maxQty: number;
  delay: string;
  expiryDate: string;
  status: 'Active' | 'Paused' | 'Expired';
  createdAt: string;
};

const SubscriptionsPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  
  const [targetLink, setTargetLink] = useState('');
  const [minQty, setMinQty] = useState(100);
  const [maxQty, setMaxQty] = useState(500);
  const [delay, setDelay] = useState('No Delay');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    // Load from localStorage panel_services (so any admin edits show up immediately) asynchronously
    setTimeout(() => {
      const savedServices = localStorage.getItem('panel_services');
      let isMockData = false;
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices) as AdminService[];
          if (parsed.length < 50) {
            isMockData = true;
          }
        } catch (e) {
          isMockData = true;
        }
      }

      if (savedServices && !isMockData) {
        try {
          const parsed = JSON.parse(savedServices) as AdminService[];
          // Only active services show to customer
          const activeServices = parsed
            .filter((s: AdminService) => s.status === 'Active')
            .map((s: AdminService) => ({
              id: s.id,
              category: s.category,
              name: s.name,
              rate: parseFloat(s.rate),
              min: s.min || 10,
              max: s.max || 10000,
              description: s.description || ''
            }));
          
          setServices(activeServices);
          const cats = Array.from(new Set(activeServices.map((s: Service) => s.category))) as string[];
          setCategories(cats);
          if (cats.length > 0) {
            setSelectedCategory(cats[0]);
            const firstService = activeServices.find((s: Service) => s.category === cats[0]);
            if (firstService) setSelectedServiceId(firstService.id);
          }
        } catch (e) {
          console.error("Failed to parse local services", e);
        }
      } else {
        // Fallback
        fetch('/api/services')
          .then(res => res.json())
          .then(data => {
            const mapped = data.map((s: Service) => ({
              ...s,
              rate: parseFloat(String(s.rate)) * 0.6 // 40% discount!
            }));
            localStorage.setItem('panel_services', JSON.stringify(mapped.map((s: Service) => ({
              id: s.id, name: s.name, category: s.category,
              rate: s.rate.toFixed(2), providerRate: (s.rate / 0.6 * 0.8).toFixed(2),
              originalRate: (s.rate / 0.6 * 0.8).toFixed(2), isProviderInr: true,
              providerId: String(s.id), description: s.description || '', status: 'Active'
            }))));
            localStorage.setItem('peaksender_price_discount_40_applied', 'true');
            setServices(mapped);
            const cats = Array.from(new Set(mapped.map((s: Service) => s.category))) as string[];
            setCategories(cats);
            if (cats.length > 0) {
              setSelectedCategory(cats[0]);
              const firstService = mapped.find((s: Service) => s.category === cats[0]);
              if (firstService) setSelectedServiceId(firstService.id);
            }
          })
          .catch(err => console.error(err));
      }
    }, 0);

    // Load active subscriptions asynchronously to avoid linter set-state-in-effect issues
    const saved = localStorage.getItem('peaksender_subscriptions');
    if (saved) {
      setTimeout(() => {
        try {
          setSubscriptions(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }, 0);
    } else {
      const defaultSubs: Subscription[] = [
        {
          id: 'SUB-5521',
          categoryName: 'Instagram Followers [ 𝗔𝗽𝗽 𝗗𝗮𝘁𝗮 𝗔𝗰𝗰𝗼𝘂𝗻𝘁𝘀 - Super Cheapest ] ᴺᴱᵂ',
          serviceName: '☑️ Instagram Followers【 𝗔𝗽𝗽 𝗗𝗮𝘁𝗮 𝗔𝗰𝗰𝗼𝘂𝗻𝘁𝘀 - 10K - 50K+/Day - Instant - 𝗡𝗢 𝗥𝗘𝗙𝗜𝗟𝗟 - Max 100K🔥]©️',
          targetLink: '@peaksender',
          minQty: 100,
          maxQty: 300,
          delay: '5 Minutes',
          expiryDate: '2026-07-23',
          status: 'Active',
          createdAt: '2026-05-20 10:15'
        }
      ];
      localStorage.setItem('peaksender_subscriptions', JSON.stringify(defaultSubs));
      setTimeout(() => {
        setSubscriptions(defaultSubs);
      }, 0);
    }

    // Mount instruction toast
    showToast('info', 'Instruction: Username/Link should be public and active for automatic new post scanning.');
  }, []);

  // Derived state (no useEffect required, avoiding React linter errors)
  const categoryServices = services.filter(s => s.category === selectedCategory);
  const selectedService = services.find(s => s.id === selectedServiceId) || categoryServices[0] || null;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const firstService = services.find(s => s.category === cat);
    if (firstService) {
      setSelectedServiceId(firstService.id);
    } else {
      setSelectedServiceId(null);
    }
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedService || !targetLink || minQty <= 0 || maxQty <= 0) {
      const errMsg = 'Please fill all fields correctly.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    if (minQty > maxQty) {
      const errMsg = 'Min quantity cannot be greater than Max quantity.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    const setupFee = 100.00; // Flat ₹100 setup fee
    const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '12500.00');

    if (currentBalance < setupFee) {
      const errMsg = `Insufficient balance! Retainer setup requires ₹${setupFee.toFixed(2)} but your balance is ₹${currentBalance.toFixed(2)}.`;
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
        const newBalance = currentBalance - setupFee;
        localStorage.setItem('peaksender_balance', newBalance.toString());

        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
        const subId = 'SUB-' + Math.floor(1000 + Math.random() * 9000);

        const newSub: Subscription = {
          id: subId,
          categoryName: selectedCategory,
          serviceName: selectedService.name,
          targetLink,
          minQty,
          maxQty,
          delay,
          expiryDate: expiryDate || 'No Expiry',
          status: 'Active',
          createdAt: dateStr
        };

        const updatedList = [newSub, ...subscriptions];
        localStorage.setItem('peaksender_subscriptions', JSON.stringify(updatedList));
        setSubscriptions(updatedList);

        // Reset
        setTargetLink('');
        setMinQty(100);
        setMaxQty(500);
        setDelay('No Delay');
        setExpiryDate('');

        const successMsg = `Subscription #${subId} configured successfully! ₹100.00 setup fee deducted.`;
        setMessage({ type: 'success', text: successMsg });
        showToast('success', successMsg);
        
        // Dispatch event
        window.dispatchEvent(new Event('peaksender_balance_update'));
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to create subscription.';
        setMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const toggleStatus = (subId: string) => {
    const updated = subscriptions.map(sub => {
      if (sub.id === subId) {
        const nextStatus: 'Active' | 'Paused' = sub.status === 'Active' ? 'Paused' : 'Active';
        return { ...sub, status: nextStatus };
      }
      return sub;
    });
    localStorage.setItem('peaksender_subscriptions', JSON.stringify(updated));
    setSubscriptions(updated);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>New Subscription</h2>
          
          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleCreateSubscription}>
            <div className={styles.field}>
              <label>Category</label>
              <select 
                className="glass"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Service</label>
              <select 
                className="glass"
                value={selectedServiceId || ''}
                onChange={(e) => {
                  setSelectedServiceId(parseInt(e.target.value));
                }}
              >
                {categoryServices.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - ₹{s.rate}</option>
                ))
                }
              </select>
            </div>
            <div className={styles.field}>
              <label>Username / Link</label>
              <input 
                type="text" 
                placeholder="@username" 
                className="glass"
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className={styles.field}>
                <label>Min Quantity</label>
                <input 
                  type="number" 
                  placeholder="100" 
                  className="glass"
                  value={minQty || ''}
                  onChange={(e) => setMinQty(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Max Quantity</label>
                <input 
                  type="number" 
                  placeholder="500" 
                  className="glass"
                  value={maxQty || ''}
                  onChange={(e) => setMaxQty(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Delay (Minutes)</label>
              <select 
                className="glass"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
              >
                <option value="No Delay">No Delay</option>
                <option value="5 Minutes">5 Minutes</option>
                <option value="15 Minutes">15 Minutes</option>
                <option value="30 Minutes">30 Minutes</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Expiry Date (Optional)</label>
              <input 
                type="date" 
                className="glass"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className={`${styles.priceSummary} glass`}>
              <div className={styles.priceRow}>
                <span>Auto Setup retainer fee:</span>
                <span>₹100.00</span>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Configuring Setup...' : 'Create Subscription'}
            </button>
          </form>
        </div>

        {/* Dynamic Subscriptions List */}
        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`}>
            <h3>Active Subscriptions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {subscriptions.map((sub, i) => (
                <div key={i} style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--card-border)',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>{sub.id}</span>
                    <span className={`${styles.statusBadge} ${sub.status === 'Active' ? styles.completed : styles.pending}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                      {sub.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.3rem' }}>{sub.targetLink}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{sub.serviceName}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                    <span>Min/Max: {sub.minQty}/{sub.maxQty}</span>
                    <span>Delay: {sub.delay}</span>
                  </div>
                  
                  <button
                    onClick={() => toggleStatus(sub.id)}
                    style={{ 
                      marginTop: '0.8rem', 
                      fontSize: '0.75rem', 
                      color: sub.status === 'Active' ? '#f59e0b' : '#10b981',
                      border: `1px solid ${sub.status === 'Active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      background: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    {sub.status === 'Active' ? '⏸️ Pause Auto' : '▶️ Resume Auto'}
                  </button>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>No active auto subscriptions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
