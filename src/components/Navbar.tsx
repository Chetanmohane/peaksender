'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change / outside click
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className={`${styles.navbar} glass`} style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.03)' }}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <span className="text-gradient">Peak</span>Sender
          </Link>

          {/* Desktop Links */}
          <div className={styles.links}>
            <Link href="/services" className={styles.link}>Services</Link>
            <Link href="/blog" className={styles.link}>Blog</Link>
            <Link href="/admin" className={styles.link} style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin</Link>
            <div className={styles.auth}>
              <Link href="/auth/login" className={styles.loginBtn}>Sign In</Link>
              <Link href="/auth/register" className={styles.signupBtn}>Sign Up</Link>
            </div>
          </div>

          {/* Hamburger Button (Mobile only) */}
          <button
            className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={closeMenu} />
      )}

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <span className="text-gradient">Peak</span>Sender
          </Link>
          <button className={styles.closeBtn} onClick={closeMenu} aria-label="Close menu">✕</button>
        </div>
        <nav className={styles.mobileNav}>
          <Link href="/services" className={styles.mobileLink} onClick={closeMenu}>💎 Services</Link>
          <Link href="/blog" className={styles.mobileLink} onClick={closeMenu}>📝 Blog</Link>
          <Link href="/admin" className={`${styles.mobileLink} ${styles.mobileLinkAdmin}`} onClick={closeMenu}>🔑 Admin Panel</Link>
          <div className={styles.mobileAuthRow}>
            <Link href="/auth/login" className={styles.mobileLoginBtn} onClick={closeMenu}>Sign In</Link>
            <Link href="/auth/register" className={styles.mobileSignupBtn} onClick={closeMenu}>Sign Up Free</Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
