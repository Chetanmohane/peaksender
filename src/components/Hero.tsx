import React from 'react';
import styles from './Hero.module.css';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={`${styles.content} animate-fade`}>
          <h1 className={styles.title}>
            The Fastest <span className="text-gradient">SMM Services</span> For Your Growth
          </h1>
          <p className={styles.subtitle}>
            Boost your social presence instantly with our high-quality, 
            reliable, and affordable SMM solutions. Trusted by thousands of creators worldwide.
          </p>
          <div className={styles.actions}>
            <Link href="/auth/register" className={styles.primaryBtn}>
              Get Started Now
            </Link>
            <Link href="/services" className={styles.secondaryBtn}>
              View Services
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <h3>1M+</h3>
              <p>Orders Done</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>0.1s</h3>
              <p>Fast Delivery</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>24/7</h3>
              <p>Live Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
