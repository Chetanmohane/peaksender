'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

const ADMIN_NAV = [
  { href: '/admin',          label: '📊 Overview' },
  { href: '/admin/users',    label: '👥 Users' },
  { href: '/admin/services', label: '💎 Services' },
  { href: '/admin/orders',   label: '📋 Orders' },
  { href: '/admin/payments', label: '💰 Payments' },
  { href: '/admin/affiliates', label: '🤝 Affiliates' },
  { href: '/admin/tickets',  label: '🎧 Tickets' },
  { href: '/admin/settings', label: '⚙️ Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('peaksender27@gmail.com');
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const checkAdmin = () => {
      const savedProfile = localStorage.getItem('peaksender_profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.email === 'peaksender27@gmail.com') {
            setIsAdmin(true);
            setAdminEmail(profile.email);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setIsAdmin(false);
    };

    checkAdmin();

    const sync = () => {
      checkAdmin();
    };

    window.addEventListener('storage', sync);
    window.addEventListener('peaksender_profile_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('peaksender_profile_update', sync);
    };
  }, []);

  if (isAdmin === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#050505',
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#050505',
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif',
        padding: '2rem'
      }}>
        <div className={styles.deniedCard}>
          <div className={styles.deniedIcon}>🔒</div>
          <h1 className={styles.deniedTitle}>Access Denied</h1>
          <p className={styles.deniedText}>
            This administration panel is restricted. Only authorized owners (<strong>peaksender27@gmail.com</strong>) are allowed access to this page.
          </p>
          <div className={styles.deniedActions}>
            <Link href="/dashboard" className={styles.deniedBtnPrimary}>
              Return to Dashboard
            </Link>
            <Link href="/auth/login" className={styles.deniedBtnSecondary}>
              Login as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = (onLinkClick?: () => void) =>
    ADMIN_NAV.map(({ href, label }) => (
      <Link key={href} href={href} className={styles.navLink} onClick={onLinkClick}>
        {label}
      </Link>
    ));

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '34px', width: 'auto', borderRadius: '6px' }} />
            <span style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: '800' }}>Admin</span>
          </Link>
        </div>
        <nav className={styles.nav}>{navItems()}</nav>
        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.backBtn}>👤 User View</Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className={styles.mobileBackdrop} onClick={closeSidebar} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`${styles.mobileSidebar} ${sidebarOpen ? styles.mobileSidebarOpen : ''}`}>
        <div className={styles.mobileSidebarClose}>
          <button onClick={closeSidebar} className={styles.closeBtn} aria-label="Close admin menu">✕</button>
        </div>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo} onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '34px', width: 'auto', borderRadius: '6px' }} />
            <span style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: '800' }}>Admin</span>
          </Link>
        </div>
        <nav className={styles.nav}>{navItems(closeSidebar)}</nav>
        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.backBtn} onClick={closeSidebar}>👤 User View</Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className={styles.headerTitle}>Administration Panel</div>
          <div className={styles.adminUser}>
            <span className={styles.adminEmail}>{adminEmail}</span>
            <div className={styles.badge}>Owner</div>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
