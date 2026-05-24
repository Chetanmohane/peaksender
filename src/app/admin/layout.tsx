'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

const ADMIN_NAV = [
  { href: '/admin',          label: '📊 Overview' },
  { href: '/admin/users',    label: '👥 Users' },
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
  const closeSidebar = () => setSidebarOpen(false);

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
          <Link href="/" className={styles.logo}>
            <span style={{ color: '#ef4444' }}>Admin</span>Peak
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
          <Link href="/" className={styles.logo} onClick={closeSidebar}>
            <span style={{ color: '#ef4444' }}>Admin</span>Peak
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
            <span className={styles.adminEmail}>peaksender27@gmail.com</span>
            <div className={styles.badge}>Owner</div>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
