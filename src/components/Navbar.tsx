'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('peaksender_theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    syncTheme();
    window.addEventListener('peaksender_theme_update', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('peaksender_theme_update', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('peaksender_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new Event('peaksender_theme_update'));
  };

  useEffect(() => {
    const sync = () => {
      const savedProfile = localStorage.getItem('peaksender_profile');
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          setIsLoggedIn(true);
          setIsAdmin(p.email === 'peaksender27@gmail.com');
        } catch (e) {
          console.error(e);
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    sync();

    window.addEventListener('storage', sync);
    window.addEventListener('peaksender_profile_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('peaksender_profile_update', sync);
    };
  }, []);

  // Close menu on route change / outside click
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className={`${styles.navbar} glass`} style={{ borderBottom: scrolled ? '1px solid var(--card-border)' : '1px solid transparent' }}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.jpg" alt="The SMM Logo" style={{ height: '44px', width: 'auto', borderRadius: '8px' }} />
          </Link>

          {/* Desktop Links */}
          <div className={styles.links}>
            <Link href="/services" className={styles.link}>Services</Link>
            <Link href="/blog" className={styles.link}>Blog</Link>
            {isAdmin && (
              <Link href="/admin" className={styles.link} style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin</Link>
            )}
            <button 
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className={styles.auth}>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className={styles.loginBtn}>Dashboard</Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('peaksender_profile');
                      window.dispatchEvent(new Event('peaksender_profile_update'));
                      window.location.reload();
                    }}
                    className={styles.signupBtn}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.loginBtn}>Sign In</Link>
                  <Link href="/auth/register" className={styles.signupBtn}>Sign Up</Link>
                </>
              )}
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
          <Link href="/" className={styles.logo} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.jpg" alt="The SMM Logo" style={{ height: '38px', width: 'auto', borderRadius: '6px' }} />
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ width: '36px', height: '36px', fontSize: '1rem' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={styles.closeBtn} onClick={closeMenu} aria-label="Close menu">✕</button>
          </div>
        </div>
        <nav className={styles.mobileNav}>
          <Link href="/services" className={styles.mobileLink} onClick={closeMenu}>💎 Services</Link>
          <Link href="/blog" className={styles.mobileLink} onClick={closeMenu}>📝 Blog</Link>
          {isAdmin && (
            <Link href="/admin" className={`${styles.mobileLink} ${styles.mobileLinkAdmin}`} onClick={closeMenu}>🔑 Admin Panel</Link>
          )}
          <div className={styles.mobileAuthRow}>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className={styles.mobileLoginBtn} onClick={closeMenu}>Dashboard</Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('peaksender_profile');
                    window.dispatchEvent(new Event('peaksender_profile_update'));
                    closeMenu();
                    window.location.reload();
                  }}
                  className={styles.mobileSignupBtn}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', padding: '0.8rem' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.mobileLoginBtn} onClick={closeMenu}>Sign In</Link>
                <Link href="/auth/register" className={styles.mobileSignupBtn} onClick={closeMenu}>Sign Up Free</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
