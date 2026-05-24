/// src/app/customer/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styles from '../../dashboard/orders/orders.module.css'; // reuse admin table styles

// Order type must match lib definition
type Order = {
  id: string;
  customer: string;
  serviceName: string;
  link: string;
  charge: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Canceled';
  createdAt: string;
};

const STATUS_CONFIG: Record<Order['status'], { color: string; bg: string; icon: string }> = {
  Completed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
  'In Progress': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '⚡' },
  Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🕐' },
  Canceled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
};

const CustomerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    const stored = localStorage.getItem('peaksender_orders');
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  };

  // Load on mount and listen for external changes (admin page updates localStorage)
  useEffect(() => {
    loadOrders();
    const handler = (e: StorageEvent) => {
      if (e.key === 'peaksender_orders') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Orders</h2>
        <p className={styles.pageSubtitle}>{orders.length} orders</p>
      </div>
      <div className={`${styles.tableWrap} glass animate-fade`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Service</th>
              <th>Link</th>
              <th>Charge</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.orderId}>{order.id}</td>
                  <td className={styles.date}>{order.createdAt}</td>
                  <td className={styles.serviceName}>{order.serviceName}</td>
                  <td className={styles.linkCell}>
                    <a href={order.link} target="_blank" rel="noopener noreferrer" className={styles.linkAnchor}>
                      {order.link.replace(/^https?:\/\//, '')}
                    </a>
                  </td>
                  <td className={styles.charge}>₹{order.charge.toFixed(2)}</td>
                  <td>
                    <span className={styles.badge} style={{ background: cfg?.bg, color: cfg?.color }}>
                      {cfg?.icon} {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className={styles.emptyState}>
            <span style={{ fontSize: '3rem' }}>📦</span>
            <p>No orders found. Your admin may not have created any yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
