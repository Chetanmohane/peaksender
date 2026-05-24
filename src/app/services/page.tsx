'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import { services } from '@/lib/services';
import ServiceSlider from '@/components/ServiceSlider';
import styles from './services.module.css';

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
const [modalOpen, setModalOpen] = useState(false);
const [modalDesc, setModalDesc] = useState('');

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Categories' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All Categories', ...Array.from(new Set(services.map(s => s.category)))];

  const showDetails = (desc: string) => {
  setModalDesc(desc);
  setModalOpen(true);
};

  return (
    <main>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className="text-gradient">Our Services</h1>
          <p>Explore our wide range of social media growth solutions at unbeatable prices.</p>
        </div>
        <ServiceSlider />
      </div>

      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search services by ID or name..." 
              className={`${styles.input} glass`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className={`${styles.select} glass`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.tableWrapper} glass animate-fade`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Rate per 1000</th>
                  <th>Min / Max</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td className={styles.idCol}>{service.id}</td>
                    <td className={styles.nameCol}>
                      <span className={styles.category}>{service.category}</span>
                      <p>{service.name}</p>
                    </td>
                    <td className={styles.rateCol}>₹{service.rate.toFixed(2)}</td>
                    <td className={styles.minMaxCol}>{service.min} / {service.max}</td>
                    <td className={styles.descCol}>
                      <button type="button" className={styles.detailsBtn} onClick={() => showDetails(service.description)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredServices.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No services found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </section>
      <Modal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  title="Service Details"
>
  <p>{modalDesc}</p>
</Modal>
<Footer />
    </main>
  );
};

export default ServicesPage;
