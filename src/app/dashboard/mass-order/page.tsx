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

type ReceiptItem = {
  lineNum: number;
  rawLine: string;
  status: 'success' | 'failed';
  orderId?: string;
  serviceName?: string;
  charge?: number;
  error?: string;
};

const MassOrderPage = () => {
  const [inputText, setInputText] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(12500.00);
  const [receipts, setReceipts] = useState<ReceiptItem[] | null>(null);
  const [generalMessage, setGeneralMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load SMM database
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Failed to load services", err));

    // Load Balance asynchronously
    setTimeout(() => {
      const savedBalance = localStorage.getItem('peaksender_balance');
      if (savedBalance) setBalance(parseFloat(savedBalance));
    }, 0);

    const handleBalanceUpdate = () => {
      const currentBalance = localStorage.getItem('peaksender_balance');
      if (currentBalance) setBalance(parseFloat(currentBalance));
    };

    window.addEventListener('peaksender_balance_update', handleBalanceUpdate);

    // Removed instruction toast on mount to stop repetitive popups
    return () => {
      window.removeEventListener('peaksender_balance_update', handleBalanceUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralMessage(null);
    setReceipts(null);

    const cleanInput = inputText.trim();
    if (!cleanInput) {
      const errMsg = 'Please enter at least one order line.';
      setGeneralMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
      return;
    }

    setLoading(true);

    const lines = cleanInput.split('\n');
    const results: ReceiptItem[] = [];
    let totalCost = 0;
    const validOrdersToPlace: { service: Service, quantity: number, link: string, charge: number }[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const rawLine = line.trim();

      if (rawLine === '') return;

      const parts = rawLine.split('|');
      if (parts.length < 3) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: 'Invalid format. Use: service_id | quantity | link'
        });
        return;
      }

      const serviceId = parseInt(parts[0].trim());
      const quantity = parseInt(parts[1].trim());
      const link = parts[2].trim();

      if (isNaN(serviceId)) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: 'Invalid Service ID (must be a number)'
        });
        return;
      }

      if (isNaN(quantity) || quantity <= 0) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: 'Invalid quantity (must be greater than 0)'
        });
        return;
      }

      if (!link) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: 'Missing link'
        });
        return;
      }

      // Find service in SMM database
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: `Service ID ${serviceId} not found in database`
        });
        return;
      }

      if (quantity < service.min || quantity > service.max) {
        results.push({
          lineNum,
          rawLine,
          status: 'failed',
          error: `Quantity out of bounds. Min: ${service.min}, Max: ${service.max}`
        });
        return;
      }

      // Calculate Cost
      const charge = (quantity * service.rate) / 1000;
      totalCost += charge;

      validOrdersToPlace.push({
        service,
        quantity,
        link,
        charge
      });
    });

    const currentBalance = parseFloat(localStorage.getItem('peaksender_balance') || '0');

    if (currentBalance < totalCost) {
      const errMsg = `Insufficient balance for all orders! Total required: ₹${totalCost.toFixed(2)}, available: ₹${currentBalance.toFixed(2)}.`;
      setGeneralMessage({
        type: 'error',
        text: errMsg
      });
      showToast('error', errMsg);
      setLoading(false);
      return;
    }

    if (validOrdersToPlace.length === 0) {
      setReceipts(results);
      setLoading(false);
      return;
    }

    try {
      const profileStr = localStorage.getItem('peaksender_profile');
      let customerName = 'john_doe';
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.name) customerName = profile.name;
        } catch (e) {}
      }

      const res = await fetch('/api/order/mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerName,
          orders: validOrdersToPlace.map(o => ({
            serviceId: o.service.id,
            serviceName: o.service.name,
            link: o.link,
            quantity: o.quantity,
            charge: o.charge
          }))
        })
      });

      const data = await res.json();

      if (data.success) {
        const newBalance = data.balance;
        const totalPlacedCount = data.placedOrders.length;

        // Deduct balance and update count
        localStorage.setItem('peaksender_balance', newBalance.toString());

        const savedTotalOrders = parseInt(localStorage.getItem('peaksender_total_orders') || '0');
        localStorage.setItem('peaksender_total_orders', (savedTotalOrders + totalPlacedCount).toString());

        // Map successful database order IDs back into results receipt items
        data.placedOrders.forEach((placed: any, idx: number) => {
          results.push({
            lineNum: results.length + 1,
            rawLine: `${placed.serviceId} | ${placed.quantity} | ${placed.link}`,
            status: 'success',
            orderId: placed.orderId,
            serviceName: placed.serviceName,
            charge: parseFloat(placed.charge)
          });
        });

        // Sync header balance
        setBalance(newBalance);
        window.dispatchEvent(new Event('peaksender_balance_update'));

        setInputText('');
        setReceipts(results);
        
        const successMsg = `Successfully processed mass orders! Placed ${totalPlacedCount} orders. Charged ₹${totalCost.toFixed(2)}.`;
        setGeneralMessage({
          type: 'success',
          text: successMsg
        });
        showToast('success', successMsg);
      } else {
        const errMsg = data.error || 'Failed to place mass orders.';
        setGeneralMessage({ type: 'error', text: errMsg });
        showToast('error', errMsg);
      }
    } catch (err) {
      console.error(err);
      const errMsg = 'Error connecting to server. Please try again.';
      setGeneralMessage({ type: 'error', text: errMsg });
      showToast('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
        <div className={`${styles.statCard} glass animate-fade`}>
          <label>Account Balance</label>
          <h3>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.orderCard} glass animate-fade`}>
          <h2>Mass Order</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            One order per line in format: <code style={{ color: 'var(--accent)' }}>service_id | quantity | link</code>
          </p>

          {generalMessage && (
            <div className={`${styles.alert} ${generalMessage.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '2rem' }}>
              {generalMessage.text}
            </div>
          )}

          <form className={styles.orderForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <textarea 
                rows={12} 
                className="glass" 
                placeholder="16440 | 1000 | https://instagram.com/user&#10;12600 | 500 | https://tiktok.com/@video123"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ padding: '1.5rem', fontSize: '1rem', color: 'var(--foreground)', border: 'none', outline: 'none', borderRadius: '16px' }}
                disabled={loading}
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading ? 'Processing Orders...' : 'Submit Mass Order'}
            </button>
          </form>
        </div>

        {/* Dynamic Interactive Receipt */}
        {receipts && (
          <div className={`${styles.infoCol} animate-fade`}>
            <div className={`${styles.infoCard} glass`}>
              <h3>Mass Order Receipts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {receipts.map((rec, i) => (
                  <div key={i} style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: rec.status === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: rec.status === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Line #{rec.lineNum}</span>
                      <span className={`${styles.statusBadge} ${rec.status === 'success' ? styles.completed : styles.canceled}`} style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                        {rec.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <code style={{ fontSize: '0.85rem', display: 'block', color: '#cbd5e1', marginBottom: '0.5rem' }}>&quot;{rec.rawLine}&quot;</code>
                    {rec.status === 'success' ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <p style={{ color: 'var(--foreground)', fontWeight: '500' }}>Order Placed: <span style={{ color: 'var(--accent)' }}>{rec.orderId}</span></p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{rec.serviceName}</p>
                        <p style={{ color: '#10b981', fontWeight: 'bold', marginTop: '0.2rem' }}>Charge: ₹{rec.charge?.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '500' }}>❌ Error: {rec.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MassOrderPage;
