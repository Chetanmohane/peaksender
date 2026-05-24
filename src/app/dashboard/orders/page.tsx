'use client';

import React, { useState, useEffect } from 'react';
import styles from './orders.module.css';

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

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-7721', serviceId: 16440,
    serviceName: '➤ Instagram Followers »【 Real - HQ Accounts - 50K+ Per Day - No Drop - Instant - Lifetime Refill ♻️】🔥',
    link: 'https://instagram.com/peaksender',
    quantity: 1000, charge: 51.96, status: 'Completed', createdAt: '2026-05-10 14:20',
  },
  {
    id: 'ORD-9932', serviceId: 12600,
    serviceName: '⭆ Tiktok Likes【 HQ Accounts - 50K+ Per Day🚀 - Instant - No Refill 】🔥',
    link: 'https://tiktok.com/@video123',
    quantity: 5000, charge: 97.85, status: 'Pending', createdAt: '2026-05-11 09:45',
  },
  {
    id: 'ORD-1234', serviceId: 15404,
    serviceName: '▶ YouTube » Likes【 High Quality - 2K–10K/Day - Instant - 30 Days Refill 】🔥',
    link: 'https://youtube.com/watch?v=peaksender',
    quantity: 200, charge: 16.20, status: 'In Progress', createdAt: '2026-05-11 11:30',
  },
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Canceled'] as const;
type StatusFilter = typeof STATUSES[number];

const OrderHistoryPage = () => {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem('peaksender_orders');
      if (saved) {
        setTimeout(() => {
          try { setOrders(JSON.parse(saved)); } catch (e) { console.error(e); }
        }, 0);
      } else {
        localStorage.setItem('peaksender_orders', JSON.stringify(DEFAULT_ORDERS));
        setTimeout(() => setOrders(DEFAULT_ORDERS), 0);
      }
    };
    
    loadOrders();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_orders') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q)
      || o.serviceName.toLowerCase().includes(q)
      || o.link.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'All' || o.status === statusFilter);
  });

  const statusClass: Record<string, string> = {
    'Completed': styles.completed,
    'In Progress': styles.inprogress,
    'Pending': styles.pending,
    'Canceled': styles.canceled,
  };

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Order History</h2>
          <p className={styles.pageSubtitle}>
            {orders.length} total orders · {filtered.length} showing
          </p>
        </div>
      </div>

      {/* ── Controls: Filter + Search ── */}
      <div className={styles.controls}>
        {/* Status Filter Tabs */}
        <div className={styles.filterRow}>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.activeFilter : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s !== 'All' && STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.icon + ' '}
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
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

      {/* ── Desktop Table ── */}
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
                    <span className={`${styles.badge} ${statusClass[order.status]}`}>
                      {cfg?.icon} {order.status}
                    </span>
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

      {/* ── Mobile Cards (shown instead of table on small screens) ── */}
      <div className={styles.mobileCards}>
        {filtered.map(order => {
          const cfg = STATUS_CONFIG[order.status];
          return (
            <div key={order.id} className={`${styles.orderCard} glass animate-fade`}>
              {/* Card Top Row */}
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.cardOrderId}>{order.id}</span>
                  <span className={styles.cardDate}>{order.createdAt}</span>
                </div>
                <span
                  className={`${styles.badge} ${statusClass[order.status]}`}
                  style={{ background: cfg?.bg, color: cfg?.color }}
                >
                  {cfg?.icon} {order.status}
                </span>
              </div>

              {/* Service Name */}
              <p className={styles.cardService}>{order.serviceName}</p>

              {/* Link */}
              <a
                href={order.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardLink}
              >
                🔗 {order.link.replace(/^https?:\/\//, '').slice(0, 40)}…
              </a>

              {/* Bottom Stats */}
              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <span className={styles.cardStatLabel}>Quantity</span>
                  <span className={styles.cardStatValue}>{order.quantity.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.cardStat}>
                  <span className={styles.cardStatLabel}>Charged</span>
                  <span className={`${styles.cardStatValue} ${styles.chargeGreen}`}>
                    ₹{order.charge.toFixed(2)}
                  </span>
                </div>
                <div className={styles.cardStat}>
                  <span className={styles.cardStatLabel}>Service ID</span>
                  <span className={styles.cardStatValue}>#{order.serviceId}</span>
                </div>
              </div>

              {/* Progress Bar for In Progress */}
              {order.status === 'In Progress' && (
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar} />
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className={`${styles.emptyState} glass`}>
            <span style={{ fontSize: '2.5rem' }}>📋</span>
            <p>No orders found</p>
            <span>Try changing your filter or search term.</span>
          </div>
        )}
      </div>

      {/* ── Summary Footer ── */}
      {filtered.length > 0 && (
        <div className={`${styles.summaryBar} glass`}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Orders</span>
            <span className={styles.summaryValue}>{filtered.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Spent</span>
            <span className={`${styles.summaryValue} ${styles.chargeGreen}`}>
              ₹{filtered.reduce((s, o) => s + o.charge, 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Completed</span>
            <span className={styles.summaryValue} style={{ color: '#10b981' }}>
              {filtered.filter(o => o.status === 'Completed').length}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Pending</span>
            <span className={styles.summaryValue} style={{ color: '#f59e0b' }}>
              {filtered.filter(o => o.status === 'Pending').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
