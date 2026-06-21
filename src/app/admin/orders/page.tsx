'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../dashboard/orders/orders.module.css';
import adminStyles from '../../admin/admin.module.css';
import { showToast } from '@/components/Toast';

type Order = {
  id: string;
  serviceId: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Canceled';
  createdAt: string;
};

const STATUS_CONFIG = {
  'Completed':  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
  'In Progress':{ color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '⚡' },
  'Pending':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🕐' },
  'Canceled':   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '❌' },
};

const OrderAdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed' | 'Canceled'>('All');

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders:', e);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: 'Completed' | 'Canceled') => {
    const action = newStatus === 'Completed' ? 'complete' : 'cancel';
    try {
      const res = await fetch(`/api/admin/orders/${id}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Order status updated to ${newStatus}`);
        loadOrders();
      } else {
        showToast('error', data.error || 'Failed to update order status');
      }
    } catch (e) {
      console.error('Error updating order status:', e);
      showToast('error', 'Error updating order status');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.serviceName.toLowerCase().includes(q) || o.link.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'All' || o.status === statusFilter);
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Admin Order Management</h2>
        <p className={styles.pageSubtitle}>{orders.length} total orders · {filtered.length} showing</p>
      </div>
      <div className={styles.controls}>
        <div className={styles.filterRow}>
          {['All','Pending','In Progress','Completed','Canceled'].map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.activeFilter : ''}`}
              onClick={() => setStatusFilter(s as any)}
            >
              {s !== 'All' && STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.icon + ' '}
              {s}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search ID, service or link…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      <div className={`${styles.tableWrap} glass animate-fade`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Service</th>
              <th>Link</th>
              <th>Qty</th>
              <th>Charge</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
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
                  <td>{order.quantity.toLocaleString('en-IN')}</td>
                  <td className={styles.charge}>₹{order.charge.toFixed(2)}</td>
                 <td>
                    <span className={styles.badge} style={{ background: cfg?.bg, color: cfg?.color }}>
                      {cfg?.icon} {order.status}
                    </span>
                    {order.status !== 'Completed' && (
                      <button className={adminStyles.actionBtn} onClick={() => updateOrderStatus(order.id, 'Completed')}>✔ Complete</button>
                    )}
                    {order.status !== 'Canceled' && (
                      <button className={adminStyles.actionBtn} onClick={() => updateOrderStatus(order.id, 'Canceled')}>✖ Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <span style={{ fontSize: '3rem' }}>📋</span>
            <p>No orders found</p>
            <span>Try changing your filter or search term.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAdminPage;
