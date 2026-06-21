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
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    balance: '0.00',
    role: 'User'
  });

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to load users from MySQL:', e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateBalanceClick = (id: string, currentBalance: number) => {
    setBalanceModal({ id, amount: currentBalance.toString() });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      showToast('error', 'All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          balance: parseFloat(newUser.balance),
          role: newUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'New user account created successfully');
        setAddUserModal(false);
        setNewUser({
          username: '',
          email: '',
          password: '',
          balance: '0.00',
          role: 'User'
        });
        loadUsers();
      } else {
        showToast('error', data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Connection error. Please try again.');
    }
  };

  const submitBalanceUpdate = async () => {
    if (!balanceModal) return;
    const { id, amount } = balanceModal;
    
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) {
      showToast('error', 'Please enter a valid positive number');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parsed })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Balance updated to ₹${parsed.toFixed(2)}`);
        
        const profileStr = localStorage.getItem('peaksender_profile');
        const targetUser = users.find(u => u.id === id);
        if (profileStr && targetUser) {
          try {
            const profile = JSON.parse(profileStr);
            if (profile.name === targetUser.username) {
              localStorage.setItem('peaksender_balance', parsed.toString());
              window.dispatchEvent(new Event('peaksender_balance_update'));
            }
          } catch (e) {}
        }
        
        loadUsers();
      } else {
        showToast('error', data.error || 'Failed to update balance');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Error updating balance');
    }
    
    setBalanceModal(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'User details updated successfully');
        loadUsers();
      } else {
        showToast('error', data.error || 'Failed to update user details');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Error updating user details');
    }
    setEditingUser(null);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `User marked as ${newStatus}`);
        loadUsers();
      } else {
        showToast('error', data.error || 'Failed to update status');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Error updating status');
    }
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
          <button 
            className={styles.actionBtn} 
            style={{ background: '#ef4444', padding: '0.8rem 1.5rem', margin: 0 }}
            onClick={() => setAddUserModal(true)}
          >
            Add New User
          </button>
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

      {/* Add User Modal */}
      {addUserModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + " glass animate-fade"} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Add New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className={styles.field} style={{ marginBottom: '1rem' }}>
                <label>Username</label>
                <input 
                  type="text" 
                  value={newUser.username} 
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="glass"
                  placeholder="e.g. user123"
                  required
                />
              </div>

              <div className={styles.field} style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="glass"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className={styles.field} style={{ marginBottom: '1rem' }}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="glass"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className={styles.field} style={{ marginBottom: '1rem' }}>
                <label>Starting Balance (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newUser.balance} 
                  onChange={e => setNewUser({...newUser, balance: e.target.value})}
                  className="glass"
                  required
                />
              </div>

              <div className={styles.field} style={{ marginBottom: '2rem' }}>
                <label>Role</label>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="glass"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className={styles.submitBtn} style={{ flex: 1, height: '45px' }}>Create User</button>
                <button type="button" className={styles.cancelBtn} style={{ flex: 1, height: '45px' }} onClick={() => setAddUserModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
