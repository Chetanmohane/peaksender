'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { showToast } from '@/components/Toast';

type User = {
  id: string;
  username: string;
  email: string;
  balance: number;
  status: 'Active' | 'Banned';
  createdAt: string;
  role?: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [balanceModal, setBalanceModal] = useState<{ id: string, amount: string } | null>(null);

  // Load users from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const saved = localStorage.getItem('peaksender_admin_users');
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        // Mock initial data
        const initial: User[] = [
          { id: '1', username: 'admin_peak', email: 'peaksender27@gmail.com', balance: 1000.00, status: 'Active', createdAt: '2026-05-01', role: 'Admin' },
          { id: '2', username: 'john_doe', email: 'john@example.com', balance: 150.45, status: 'Active', createdAt: '2026-05-05', role: 'User' }
        ];
        setUsers(initial);
        localStorage.setItem('peaksender_admin_users', JSON.stringify(initial));
      }
    };
    
    loadUsers();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_admin_users') {
        loadUsers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('peaksender_admin_users', JSON.stringify(newUsers));
  };

  const handleUpdateBalanceClick = (id: string, currentBalance: number) => {
    setBalanceModal({ id, amount: currentBalance.toString() });
  };

  const submitBalanceUpdate = () => {
    if (!balanceModal) return;
    const { id, amount } = balanceModal;
    
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) {
      showToast('error', 'Please enter a valid positive number');
      return;
    }

    const updated = users.map(u => u.id === id ? { ...u, balance: parsed } : u);
    saveUsers(updated);
    showToast('success', `Balance updated to ₹${parsed.toFixed(2)}`);
    
    // If updating main user, sync to global balance
    if (id === '1') {
      localStorage.setItem('peaksender_balance', parsed.toString());
      window.dispatchEvent(new Event('peaksender_balance_update'));
    }
    
    setBalanceModal(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    saveUsers(updated);
    setEditingUser(null);
    showToast('success', 'User details updated successfully');
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    const updated = users.map(u => u.id === id ? { ...u, status: newStatus as 'Active' | 'Banned' } : u);
    saveUsers(updated);
    showToast('success', `User marked as ${newStatus}`);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="glass"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #1e293b' }}
          />
          <button className={styles.actionBtn} style={{ background: '#ef4444', padding: '0.8rem 1.5rem', margin: 0 }}>Add New User</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{user.balance.toFixed(2)}</td>
                <td>
                  <span className={`${styles.status} ${user.status === 'Active' ? styles.success : styles.danger}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.actionBtn} onClick={() => handleUpdateBalanceClick(user.id, user.balance)}>Update Balance</button>
                    <button className={styles.actionBtn} onClick={() => handleEditClick(user)}>Edit</button>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => toggleStatus(user.id, user.status)}
                      style={{ color: user.status === 'Active' ? '#f59e0b' : '#10b981' }}
                    >
                      {user.status === 'Active' ? 'Ban' : 'Unban'}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + " glass animate-fade"} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Edit User: {editingUser.username}</h3>
            
            <div className={styles.field} style={{ marginBottom: '1rem' }}>
              <label>Username</label>
              <input 
                type="text" 
                value={editingUser.username} 
                onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                className="glass"
              />
            </div>

            <div className={styles.field} style={{ marginBottom: '1rem' }}>
              <label>Email</label>
              <input 
                type="email" 
                value={editingUser.email} 
                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                className="glass"
              />
            </div>

            <div className={styles.field} style={{ marginBottom: '2rem' }}>
              <label>Role</label>
              <select 
                value={editingUser.role || 'User'} 
                onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                className="glass"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className={styles.submitBtn} style={{ flex: 1, height: '45px' }} onClick={handleSaveEdit}>Save Changes</button>
              <button className={styles.cancelBtn} style={{ flex: 1, height: '45px' }} onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {balanceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + " glass animate-fade"} style={{ maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', marginTop: 0, fontSize: '1.2rem' }}>Update Balance</h3>
            
            <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
              <label>New Balance (₹)</label>
              <input 
                type="number" 
                step="0.01"
                value={balanceModal.amount} 
                onChange={e => setBalanceModal({...balanceModal, amount: e.target.value})}
                className="glass"
                style={{ fontSize: '1.2rem', padding: '1rem' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className={styles.submitBtn} style={{ flex: 1, height: '45px', background: '#10b981' }} onClick={submitBalanceUpdate}>Update</button>
              <button className={styles.cancelBtn} style={{ flex: 1, height: '45px' }} onClick={() => setBalanceModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
