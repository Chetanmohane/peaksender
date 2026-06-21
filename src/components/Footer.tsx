import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className="text-gradient">ThePeak</span>SMM
            </Link>
            <p className={styles.tagline}>
              The world&apos;s leading social media marketing panel. 
              Scaling brands and creators since 2020.
            </p>
          </div>
          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h4>Services</h4>
              <Link href="/services">Instagram</Link>
              <Link href="/services">TikTok</Link>
              <Link href="/services">YouTube</Link>
              <Link href="/services">Facebook</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>Support</h4>
              <Link href="/faq">FAQ</Link>
              <Link href="/tickets">Support Tickets</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>Account</h4>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
              <Link href="/api">API Documentation</Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© 2026 ThePeakSMM. All rights reserved.</p>
          <div className={styles.socials}>
            {/* Social Icons would go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
