'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { showToast } from '@/components/Toast';

type Category = {
  id: number;
  name: string;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Load categories from localStorage
  useEffect(() => {
    const loadCategories = () => {
      const saved = localStorage.getItem('peaksender_categories');
      if (saved) {
        try {
          setCategories(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse categories from localStorage', e);
          setCategories([]);
        }
      } else {
        // Initialize with empty array
        localStorage.setItem('peaksender_categories', JSON.stringify([]));
        setCategories([]);
      }
    };
    
    loadCategories();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peaksender_categories') {
        loadCategories();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const persist = (updated: Category[]) => {
    setCategories(updated);
    localStorage.setItem('peaksender_categories', JSON.stringify(updated));
  };

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('error', 'Category name cannot be empty');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('error', 'Category already exists');
      return;
    }
    const newCat: Category = { id: Date.now(), name: trimmed };
    const updated = [...categories, newCat];
    persist(updated);
    setNewName('');
    showToast('success', `Category "${trimmed}" added`);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleEditSave = () => {
    if (editingId === null) return;
    const trimmed = editingName.trim();
    if (!trimmed) {
      showToast('error', 'Category name cannot be empty');
      return;
    }
    const duplicate = categories.some(c => c.id !== editingId && c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      showToast('error', 'Another category with this name already exists');
      return;
    }
    const updated = categories.map(c => (c.id === editingId ? { ...c, name: trimmed } : c));
    persist(updated);
    setEditingId(null);
    setEditingName('');
    showToast('success', 'Category updated');
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this category? This will not remove services that already use it.')) return;
    const updated = categories.filter(c => c.id !== id);
    persist(updated);
    showToast('success', 'Category removed');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Category Management</h2>
        
        {/* Add New Category */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="New category name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="glass"
            style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #1e293b', minWidth: '250px' }}
          />
          <button className={styles.actionBtn} onClick={handleAdd} style={{ background: '#ef4444', padding: '0.8rem 1.5rem', margin: 0 }}>
            + Add Category
          </button>
        </div>
      </div>

      {/* Existing Categories */}
      {categories.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#161a23', borderRadius: '12px', border: '1px solid #1e293b' }}>
          No categories created yet. Add one above!
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="glass"
                        style={{ padding: '0.5rem', borderRadius: '6px' }}
                      />
                    ) : (
                      <strong style={{ color: 'white' }}>{cat.name}</strong>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {editingId === cat.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className={styles.actionBtn} onClick={handleEditSave} style={{ background: '#10b981' }}>Save</button>
                        <button className={styles.actionBtn} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className={styles.actionBtn} onClick={() => startEdit(cat)}>Edit</button>
                        <button className={styles.actionBtn} onClick={() => handleDelete(cat.id)} style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
