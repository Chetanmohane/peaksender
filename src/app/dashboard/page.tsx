'use client';

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
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

const NewOrderPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [balance, setBalance] = useState<number>(12500.00);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(1245);

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
        // Fallback: Fetch automatically from SMM database and populate localStorage
        fetch('/api/services')
          .then(res => res.json())
          .then(data => {
            const mapped = data.map((s: Service) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              rate: (parseFloat(String(s.rate)) * 0.6).toFixed(2), // 40% discount!
              providerRate: (parseFloat(String(s.rate)) * 0.8).toFixed(2),
              originalRate: (parseFloat(String(s.rate)) * 0.8).toFixed(2),
              isProviderInr: true,
              providerId: String(s.id),
              description: s.description || '',
              status: 'Active'
            }));
            localStorage.setItem('panel_services', JSON.stringify(mapped));
            localStorage.setItem('peaksender_price_discount_40_applied', 'true');
            
            const activeServices = mapped.map((s: any) => ({
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
              const firstService = mapped.find((s: Service) => s.category === cats[0]);
              if (firstService) setSelectedServiceId(firstService.id);
            }
          })
          .catch(err => console.error(err));
      }
    }, 0);

    // Load Balance and Total Orders Count from localStorage asynchronously
    setTimeout(() => {
      const savedBalance = localStorage.getItem('peaksender_balance');
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }

      const savedTotalOrders = localStorage.getItem('peaksender_total_orders');
      if (savedTotalOrders) {
        setTotalOrdersCount(parseInt(savedTotalOrders));
      }

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
                  localStorage.setItem('peaksender_total_orders', data.totalOrders.toString());
                  setBalance(data.balance);
                  setTotalOrdersCount(data.totalOrders);
                  window.dispatchEvent(new Event('peaksender_balance_update'));
                }
              })
              .catch(err => console.error('Failed to fetch user stats on page load:', err));
          }
        } catch (e) {}
      }
    }, 0);

    const handleBalanceUpdate = () => {
      const currentBalance = localStorage.getItem('peaksender_balance');
      if (currentBalance) setBalance(parseFloat(currentBalance));

      const currentTotalOrders = localStorage.getItem('peaksender_total_orders');
      if (currentTotalOrders) setTotalOrdersCount(parseInt(currentTotalOrders));
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_balance' || e.key === 'peaksender_total_orders' || e.key === 'panel_services') {
        handleBalanceUpdate();
      }
    };

    window.addEventListener('peaksender_balance_update', handleBalanceUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('peaksender_balance_update', handleBalanceUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Derived state (no useEffect required, avoiding React linter errors)
  const categoryServices = services.filter(s => s.category === selectedCategory);
  const selectedService = services.find(s => s.id === selectedServiceId) || categoryServices[0] || null;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const firstService = services.find(s => s.category === cat);
    if (firstService) {
      setSelectedServiceId(firstService.id);
      showToast('info', 'Instruction: Ensure the target page/profile is public! Avoid submitting the same link multiple times simultaneously.');
    } else {
      setSelectedServiceId(null);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !link || quantity <= 0) {
      setMessage({ type: 'error', text: 'Please fill all fields correctly.' });
      showToast('error', 'Please fill all fields correctly.');
      return;
    }

    if (quantity < selectedService.min || quantity > selectedService.max) {
      const errMsg = `Quantity must be between ${selectedService.min} and ${selectedService.max}.`;
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    const totalPrice = (quantity * selectedService.rate) / 1000;
    const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '12500.00');

    if (currentBalance < totalPrice) {
      const errMsg = `Insufficient balance! You need ₹${totalPrice.toFixed(2)} but your balance is ₹${currentBalance.toFixed(2)}. Please Add Funds.`;
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const profileStr = localStorage.getItem('peaksender_profile');
      let customerName = 'john_doe';
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.name) customerName = profile.name;
        } catch (e) {}
      }

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          link,
          quantity,
          charge: totalPrice,
          customer: customerName
        })
      });

      const data = await res.json();

      if (data.success) {
        const newBalance = data.balance;
        const newTotalOrders = totalOrdersCount + 1;

        // Save new balance and orders count
        localStorage.setItem('peaksender_balance', newBalance.toString());
        localStorage.setItem('peaksender_total_orders', newTotalOrders.toString());

        // Update Component States
        setBalance(newBalance);
        setTotalOrdersCount(newTotalOrders);
        setLink('');
        setQuantity(0);

        const successMsg = `Order #${data.orderId} placed successfully!`;
        setMessage({ type: 'success', text: successMsg });
        showToast('success', successMsg);

        // Dispatch storage update events to coordinate layout header balance
        window.dispatchEvent(new Event('peaksender_balance_update'));
      } else {
        const errMsg = data.error || 'An error occurred while placing your order.';
        setMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      }
    } catch (err) {
      console.error(err);
      const errMsg = 'An error occurred while placing your order.';
      setMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedService ? (quantity * selectedService.rate) / 1000 : 0;

  return (
    <div className={styles.pageContainer}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass animate-fade`}>
          <label>Account Balance</label>
          <h3>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className={`${styles.statCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
          <label>Total Orders</label>
          <h3>{totalOrdersCount.toLocaleString()}</h3>
        </div>
        <div className={`${styles.statCard} glass animate-fade`} style={{ animationDelay: '0.2s' }}>
          <label>Account Status</label>
          <h3 style={{ color: '#f59e0b' }}>VIP Elite</h3>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className={styles.filterBar}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilter : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>New Order</h2>
          
          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleOrder}>
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
                  showToast('info', 'Instruction: Ensure the target page/profile is public! Avoid submitting the same link multiple times simultaneously.');
                }}
              >
                {categoryServices.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - ₹{s.rate}</option>
                ))
                }
              </select>
            </div>
            <div className={styles.field}>
              <label>Link</label>
              <input 
                type="text" 
                placeholder="https://social.com/profile" 
                className="glass"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required 
              />
            </div>
            <div className={styles.field}>
              <label>Quantity (Min: {selectedService?.min || 0}, Max: {selectedService?.max || 0})</label>
              <input 
                type="number" 
                placeholder={`Enter quantity...`}
                className="glass"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className={`${styles.priceSummary} glass`}>
              <div className={styles.priceRow}>
                <span>Price per 1000 units:</span>
                <span>₹{selectedService?.rate.toFixed(2) || '0.00'}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total Charge:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        <div className={styles.infoCol}>
          <div className={`${styles.infoCard} glass animate-fade`} style={{ animationDelay: '0.1s' }}>
            <h3>Service Specs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>⏱️</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Start Time</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>0-1 Hour</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Speed</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>10K/Day</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Refill</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>30 Days</span>
              </div>
            </div>
            <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
            <h3>Description</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem', whiteSpace: 'pre-line' }}>
              <p>{selectedService?.description || 'Please select a service to see full description and instructions.'}</p>
            </div>
          </div>
          
          <div className={`${styles.infoCard} glass animate-fade`} style={{ animationDelay: '0.2s' }}>
            <h3>Average Completion Time</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                border: '3px solid var(--accent)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold',
                color: 'var(--foreground)' 
              }}>
                <span>12m</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Orders are currently processing very fast.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPage;
