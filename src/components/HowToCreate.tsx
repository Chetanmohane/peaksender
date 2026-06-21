import React from 'react';
import styles from './HowToCreate.module.css';

const steps = [
  {
    step: '01',
    title: 'Register Account',
    description: 'Click on the "Sign up" link in the login card or register page and fill in your details (username, email, and password).',
    icon: '👤'
  },
  {
    step: '02',
    title: 'Add Funds',
    description: 'Go to the "Add Funds" page in your dashboard and top up your account balance using our secure, automated payment methods.',
    icon: '💳'
  },
  {
    step: '03',
    title: 'Choose Service',
    description: 'Browse our massive directory of premium SMM services and select the package that fits your growth targets.',
    icon: '🛒'
  },
  {
    step: '04',
    title: 'Place Order',
    description: 'Submit your target profile link, enter the quantity, and watch your social channels scale instantly!',
    icon: '🚀'
  }
];

const HowToCreate = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            How To Create Account On <span className="text-gradient">thepeaksmm.shop?</span>
          </h2>
          <p className={styles.subtitle}>
            Get started in under 2 minutes and experience the fastest SMM provider panel.
          </p>
        </div>
        <div className={styles.grid}>
          {steps.map((s, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.stepNum}>{s.step}</div>
              <div className={styles.icon}>{s.icon}</div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToCreate;
