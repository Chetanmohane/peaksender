import React from 'react';
import styles from './Features.module.css';

const features = [
  {
    title: 'High Quality',
    description: 'We provide only the best quality services to ensure your account safety and growth.',
    icon: '💎'
  },
  {
    title: 'Instant Delivery',
    description: 'Our automated system starts working on your order immediately after payment.',
    icon: '⚡'
  },
  {
    title: 'Lowest Prices',
    description: 'We offer the most competitive rates in the market without compromising quality.',
    icon: '💰'
  },
  {
    title: 'Secure Payments',
    description: 'Multiple secure payment gateways including Crypto, Cards, and Wallets.',
    icon: '🔒'
  },
  {
    title: '24/7 Support',
    description: 'Our dedicated support team is always available to help you with any queries.',
    icon: '🎧'
  },
  {
    title: 'API Support',
    description: 'Full API support for resellers to integrate our services into their own panels.',
    icon: '⚙️'
  }
];

const Features = () => {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Why Choose <span className="text-gradient">PeakSender?</span></h2>
          <p className={styles.sectionSubtitle}>We provide the best tools and services to help you scale your social media presence effectively.</p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={`${styles.card} glass`}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
