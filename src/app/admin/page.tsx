'use client';
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingTickets: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats({
            totalSales: data.totalSales,
            totalUsers: data.totalUsers,
            totalOrders: data.totalOrders,
            pendingTickets: data.pendingTickets
          });
          setRecentOrders(data.recentOrders);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    };

    loadDashboardData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_orders' || e.key === 'peaksender_admin_users' || e.key === 'peaksender_balance') {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('peaksender_balance_update', loadDashboardData);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('peaksender_balance_update', loadDashboardData);
    };
  }, []);

  return (
    <div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <label>Total Sales</label>
          <h2>₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <div className={styles.statCard}>
          <label>Total Users</label>
          <h2>{stats.totalUsers.toLocaleString()}</h2>
        </div>
        <div className={styles.statCard}>
          <label>Total Orders</label>
          <h2>{stats.totalOrders.toLocaleString()}</h2>
        </div>
        <div className={styles.statCard}>
          <label>Pending Tickets</label>
          <h2 style={{ color: '#ef4444' }}>{stats.pendingTickets}</h2>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ padding: '1.5rem', fontWeight: 700, borderBottom: '1px solid #1e293b' }}>
          Recent Global Orders
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Link</th>
              <th>Charge</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.serviceName}
                </td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.link}
                </td>
                <td>₹{parseFloat(order.charge || 0).toFixed(2)}</td>
                <td>
                  <span className={`${styles.status} ${
                    order.status === 'Completed' ? styles.success : 
                    order.status === 'In Progress' ? styles.warning :
                    order.status === 'Pending' ? styles.warning : styles.danger
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.createdAt}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No recent orders.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;
