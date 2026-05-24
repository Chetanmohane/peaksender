import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './updates.module.css';

const updates = [
  { date: '2026-05-11', type: 'NEW SERVICE', title: 'Instagram Followers [HQ] Added', description: 'New high-quality followers service added with 365 days refill guarantee.' },
  { date: '2026-05-10', type: 'UPDATE', title: 'Payment Methods Update', description: 'PhonePe and GPay QR codes are now working instantly. No need to wait.' },
  { date: '2026-05-08', type: 'DISABLED', title: 'Twitter Retweets [Global]', description: 'Twitter retweets service is currently down for maintenance. Use the VIP alternative.' },
];

const UpdatesPage = () => {
  return (
    <main>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className="text-gradient">Service Updates</h1>
          <p>Stay informed about the latest service additions and maintenance updates.</p>
        </div>
      </div>

      <section className={styles.content}>
        <div className={styles.container}>
          {updates.map((update, index) => (
            <div key={index} className={`${styles.updateCard} glass animate-fade`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.cardHeader}>
                <span className={`${styles.badge} ${styles[update.type.toLowerCase().replace(' ', '')]}`}>{update.type}</span>
                <span className={styles.date}>{update.date}</span>
              </div>
              <h3>{update.title}</h3>
              <p>{update.description}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default UpdatesPage;
