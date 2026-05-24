'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

type Service = {
  id: number;
  name: string;
  category: string;
  rate: string;
  providerRate?: string;
  originalRate?: string;
  isProviderInr?: boolean;
  providerId?: string;
  description?: string;
  status: string;
};

const AdminServices = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [convRate, setConvRate] = useState(83);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    providerId: '',
    rate: '', // Real Provider Cost (₹ / 1000)
    originalRate: '', // Raw base rate from API
    isProviderInr: true, // Default to true since theroyalsmm uses INR by default
    sellingPrice: '',
    description: ''
  });

  // Load services and categories from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      // Load settings and services asynchronously
      setTimeout(() => {
        const settingsStr = localStorage.getItem('admin_settings');
        if (settingsStr) {
          try {
            const settings = JSON.parse(settingsStr);
            if (settings.usdToInr) setConvRate(parseFloat(settings.usdToInr));
          } catch (e) {
            console.error(e);
          }
        }

        // 40% Discount One-Time Migration for active localStorage
        const discountApplied = localStorage.getItem('peaksender_price_discount_40_applied');
        const saved = localStorage.getItem('panel_services');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Service[];
            if (!discountApplied) {
              const updated = parsed.map(s => {
                const currentPrice = parseFloat(s.rate);
                const discountedPrice = (currentPrice * 0.6).toFixed(2);
                return {
                  ...s,
                  rate: discountedPrice
                };
              });
              localStorage.setItem('panel_services', JSON.stringify(updated));
              localStorage.setItem('peaksender_price_discount_40_applied', 'true');
              setServices(updated);
            } else {
              if (parsed.length >= 50) {
                setServices(parsed);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }, 0);

      // Load persisted categories (stored as {id, name} objects)
      const savedCategories = localStorage.getItem('peaksender_categories');
      if (savedCategories) {
        try {
          const parsed = JSON.parse(savedCategories);
          // Support both plain string[] and {id,name}[] formats
          const names: string[] = parsed.map((c: string | { id: number; name: string }) =>
            typeof c === 'string' ? c : c.name
          );
          setCategories(names);
        } catch (e) {
          console.error('Failed to parse categories', e);
        }
      }

      const saved = localStorage.getItem('panel_services');
      let shouldImport = !saved;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length < 50) {
            shouldImport = true;
          }
        } catch (e) {
          shouldImport = true;
        }
      }

      if (shouldImport) {
        // Fetch automatically from SMM database to populate Admin Panel
        fetch('/api/services')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const mapped = data.map((s: { id: number; name: string; category: string; rate: number; description?: string }) => {
                const basePrice = parseFloat(String(s.rate));
                const sellingPrice = (basePrice * 0.6).toFixed(2); // 40% discount applied!
                const providerCost = (basePrice * 0.8).toFixed(2); // default 20% margin
                return {
                  id: s.id,
                  name: s.name,
                  category: s.category,
                  rate: sellingPrice,
                  providerRate: providerCost,
                  originalRate: providerCost,
                  isProviderInr: true,
                  providerId: String(s.id),
                  description: s.description || '',
                  status: 'Active'
                };
              });
              setTimeout(() => {
                setServices(mapped);
                localStorage.setItem('panel_services', JSON.stringify(mapped));
                localStorage.setItem('peaksender_price_discount_40_applied', 'true');
              }, 0);
            }
          })
          .catch(err => console.error(err));
      }
    };
    
    loadData();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panel_services' || e.key === 'peaksender_categories') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFetchDetails = async () => {
    if (!formData.providerId) return;
    
    setIsFetching(true);
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    const rateToUse = parseFloat(settings.usdToInr || '83');
    
    try {
      const res = await fetch('/api/admin/fetch-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId: formData.providerId,
          apiKey: settings.apiKey,
          apiUrl: settings.apiUrl || 'https://theroyalsmm.com/api/v2'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        const rawRate = parseFloat(data.service.rate);
        const finalRate = formData.isProviderInr ? rawRate : (rawRate * rateToUse);
        const autoSellingPrice = (finalRate * 0.6).toFixed(2); // 40% discount pre-applied
        
        setFormData({
          ...formData,
          name: data.service.name,
          category: data.service.category,
          rate: finalRate.toFixed(2),
          originalRate: data.service.rate, // Always store raw rate
          sellingPrice: autoSellingPrice,
          description: "Min: " + data.service.min + " | Max: " + data.service.max
        });
        showToast('success', 'Service details auto-filled! Selling price pre-set with 40% discount.');
      } else {
        showToast('error', data.error || 'Failed to fetch details');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error connecting to API. Check console.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleApplyGlobalDiscount = () => {
    if (services.length === 0) {
      showToast('error', 'No services found. Import services first.');
      return;
    }
    const updated = services.map(s => ({
      ...s,
      rate: (parseFloat(s.rate) * 0.6).toFixed(2)
    }));
    setServices(updated);
    localStorage.setItem('panel_services', JSON.stringify(updated));
    showToast('success', `✅ 40% discount applied to ${updated.length} services!`);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      category: service.category,
      providerId: service.providerId || '',
      rate: service.providerRate || (service.originalRate ? (parseFloat(service.originalRate) * (service.isProviderInr ? 1 : convRate)).toFixed(2) : ''),
      originalRate: service.originalRate || '',
      isProviderInr: service.isProviderInr !== undefined ? service.isProviderInr : true,
      sellingPrice: service.rate,
      description: service.description || ''
    });
    setSelectedId(service.id);
    setEditMode(true);
    setShowAddModal(true);
    showToast('info', 'Instruction: Click Fetch Details to automatically pull SMM rate and category description from Provider API.');
  };

  const [isNewCategory, setIsNewCategory] = useState(false);

  const openAddModal = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({
      name: '',
      category: '',
      providerId: '',
      rate: '',
      originalRate: '',
      isProviderInr: true,
      sellingPrice: '',
      description: ''
    });
    setShowAddModal(true);
    showToast('info', 'Instruction: Click Fetch Details to automatically pull SMM rate and category description from Provider API.');
  };

  const handleSaveService = () => {
    if (!formData.name || !formData.sellingPrice || !formData.category) {
      showToast('error', 'Please fill Name, Selling Price and Category');
      return;
    }

    let updated: Service[];
    if (editMode && selectedId) {
      updated = services.map(s => s.id === selectedId ? {
        ...s,
        name: formData.name,
        category: formData.category,
        rate: parseFloat(formData.sellingPrice).toFixed(2),
        providerRate: parseFloat(formData.rate || '0').toFixed(2),
        originalRate: formData.originalRate,
        isProviderInr: formData.isProviderInr,
        providerId: formData.providerId,
        description: formData.description
      } : s);
      showToast('success', 'Service updated successfully!');
    } else {
      const newService: Service = {
        id: Math.floor(Math.random() * 10000) + 100,
        name: formData.name,
        category: formData.category,
        rate: parseFloat(formData.sellingPrice).toFixed(2),
        providerRate: parseFloat(formData.rate || '0').toFixed(2),
        originalRate: formData.originalRate,
        isProviderInr: formData.isProviderInr,
        providerId: formData.providerId,
        description: formData.description,
        status: 'Active'
      };
      updated = [newService, ...services];
      showToast('success', 'New service added successfully!');
    }

    setServices(updated);
    localStorage.setItem('panel_services', JSON.stringify(updated));
    setShowAddModal(false);
    setEditMode(false);
    setSelectedId(null);
  };

  const handleImportAllServices = () => {
    if (services.length > 0) {
      if (!confirm('This will reset your current services in the Admin panel and import all services from the SMM database. Do you want to continue?')) {
        return;
      }
    }
    
    setIsFetching(true);
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((s: { id: number; name: string; category: string; rate: number; description?: string }) => {
            const basePrice = parseFloat(String(s.rate));
            const sellingPrice = (basePrice * 0.6).toFixed(2); // 40% discount applied!
            const providerCost = (basePrice * 0.8).toFixed(2);
            return {
              id: s.id,
              name: s.name,
              category: s.category,
              rate: sellingPrice,
              providerRate: providerCost,
              originalRate: providerCost,
              isProviderInr: true,
              providerId: String(s.id),
              description: s.description || '',
              status: 'Active'
            };
          });
          
          setServices(mapped);
          localStorage.setItem('panel_services', JSON.stringify(mapped));
          localStorage.setItem('peaksender_price_discount_40_applied', 'true');
          showToast('success', `Successfully imported ${mapped.length} services with 40% discount applied!`);
        } else {
          showToast('error', 'Failed to load services data');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('error', 'Failed to import services.');
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const toggleStatus = (id: number) => {
    let updatedStatus = '';
    const updated = services.map(s => {
      if (s.id === id) {
        updatedStatus = s.status === 'Active' ? 'Disabled' : 'Active';
        return {
          ...s,
          status: updatedStatus
        };
      }
      return s;
    });
    setServices(updated);
    localStorage.setItem('panel_services', JSON.stringify(updated));
    showToast('success', `Service status updated to ${updatedStatus}!`);
  };

  const deleteService = (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      localStorage.setItem('panel_services', JSON.stringify(updated));
      showToast('success', 'Service deleted successfully.');
    }
  };

  // Merge: manually created categories + categories already used by imported services
  const serviceCats = Array.from(new Set(services.map(s => s.category))).filter(Boolean);
  const allCategories = Array.from(new Set([...categories, ...serviceCats])).sort();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Service Management (Currency: INR ₹)</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className={styles.actionBtn} onClick={handleImportAllServices} disabled={isFetching}>
            {isFetching ? 'Importing...' : '📥 Import All Services'}
          </button>
          <button
            className={styles.actionBtn}
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
            onClick={handleApplyGlobalDiscount}
            disabled={services.length === 0}
          >
            📉 Apply 40% Discount to All
          </button>
          <button 
            className={styles.actionBtn} 
            style={{ background: '#ef4444' }}
            onClick={openAddModal}
          >
            + Add New Service
          </button>
        </div>
      </div>

      {/* Category Dropdown Filter */}
      {services.length > 0 && (
        <div className={styles.field} style={{ maxWidth: '500px', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem', display: 'block' }}>
            📂 Filter Services by Category
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select 
                value={selectedAdminCategory} 
                onChange={(e) => setSelectedAdminCategory(e.target.value)}
                className="glass"
                style={{ flex: 1, width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #1e293b', background: '#0f1117', color: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
              >
                {['All', ...allCategories].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Link href="/admin/categories" className={styles.actionBtn} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Manage Categories</Link>
            </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem', display: 'block' }}>
            * Showing {selectedAdminCategory === 'All' ? services.length : services.filter(s => s.category === selectedAdminCategory).length} SMM services out of {services.length} total.
          </span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Name</th>
              <th>Category</th>
              <th>Provider Cost (₹)</th>
              <th>Selling Price (₹)</th>
              <th>Provider ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(selectedAdminCategory === 'All' ? services : services.filter(s => s.category === selectedAdminCategory)).map((service) => {
              const displayCost = parseFloat(
                service.providerRate || 
                (service.originalRate ? (parseFloat(service.originalRate) * (service.isProviderInr ? 1 : convRate)).toFixed(2) : (parseFloat(service.rate) * 0.8).toFixed(2))
              ).toFixed(2);
              
              return (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.name}</td>
                  <td>{service.category}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>₹{displayCost}</td>
                  <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{parseFloat(service.rate).toFixed(2)}</td>
                  <td>{service.providerId || '-'}</td>
                  <td>
                    <span className={styles.status + " " + (service.status === 'Active' ? styles.success : styles.warning)}>
                      {service.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} onClick={() => handleEdit(service)}>Edit</button>
                      <button 
                        className={styles.actionBtn} 
                        style={{ color: service.status === 'Active' ? '#f59e0b' : '#10b981' }}
                        onClick={() => toggleStatus(service.id)}
                      >
                        {service.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                      <button className={styles.actionBtn} style={{ color: '#ef4444' }} onClick={() => deleteService(service.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {services.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No services added yet. Click &quot;+ Add New Service&quot; to start.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + " glass animate-fade"} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>{editMode ? 'Edit Service' : 'Add New Service'}</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className={styles.actionBtn}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.orderForm}>
              {/* Section 1: Connection */}
              <div className={styles.sectionTitle}>1. Provider Connection</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end', marginBottom: '1rem' }}>
                <div className={styles.field} style={{ flex: '1 1 200px' }}>
                  <label>Provider Service ID</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 542" 
                    className="glass"
                    value={formData.providerId}
                    onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                  />
                </div>
                <button 
                  type="button" 
                  className={styles.actionBtn} 
                  style={{ flex: '1 1 auto', height: '45px', background: '#3b82f6', padding: '0 2rem' }}
                  onClick={handleFetchDetails}
                  disabled={isFetching}
                >
                  {isFetching ? 'Fetching...' : '⚡ Auto-Fill from Provider'}
                </button>
              </div>

              <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isInr"
                  checked={formData.isProviderInr}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    let newRate = formData.rate;
                    if (formData.originalRate) {
                      const raw = parseFloat(formData.originalRate);
                      newRate = checked ? raw.toFixed(2) : (raw * convRate).toFixed(2);
                    }
                    setFormData({
                      ...formData, 
                      isProviderInr: checked,
                      rate: newRate
                    });
                  }}
                />
                <label htmlFor="isInr" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Provider API rate is already in INR ₹ (Don&apos;t convert)
                </label>
              </div>

              {/* Section 2: Basic Details */}
              <div className={styles.sectionTitle}>2. Service Details</div>
              <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.field}>
                  <label>Service Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="glass" 
                    placeholder="e.g. Instagram Followers [Real & Fast]"
                  />
                </div>
                <div className={styles.field}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Category</label>
                    <button 
                      type="button" 
                      onClick={() => setIsNewCategory(!isNewCategory)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 800 }}
                    >
                      {isNewCategory ? '← Select' : '+ New'}
                    </button>
                  </div>
                  {isNewCategory ? (
                    <input 
                      type="text" 
                      placeholder="New Category Name" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="glass" 
                    />
                  ) : (
                    <select 
                      className="glass"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Section 3: Pricing */}
              <div className={styles.sectionTitle}>3. Pricing (per 1000 Quantity)</div>
              <div className={styles.formGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.field}>
                  <label>Real Provider Cost (₹ / 1000)</label>
                  <input 
                    type="text" 
                    value={formData.rate} 
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    className="glass" 
                    placeholder="Real cost in ₹"
                  />
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                    * This is what you pay to provider for 1000 units.
                  </p>
                </div>
                <div className={styles.field}>
                  <label>Your Selling Price (₹ / 1000)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Price users will see"
                    value={formData.sellingPrice || ''} 
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    className="glass" 
                  />
                </div>
                <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Your Net Profit per 1000:</span>
                    <strong style={{ marginLeft: '10px', fontSize: '1.2rem', color: 'white' }}>
                      ₹{(parseFloat(formData.sellingPrice || '0') - parseFloat(formData.rate || '0')).toFixed(2)}
                    </strong>
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      ({(((parseFloat(formData.sellingPrice || '0') - parseFloat(formData.rate || '0')) / (parseFloat(formData.rate || '1') || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Description (Optional)</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="glass"
                  placeholder="Enter service instructions or features..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '3rem' }}>
                <button type="button" className={styles.submitBtn} style={{ flex: '1 1 200px', height: '55px', fontSize: '1rem' }} onClick={handleSaveService}>
                  🚀 {editMode ? 'Save Changes' : 'Create Service'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  style={{ flex: '1 1 200px', height: '55px', fontSize: '1rem' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
