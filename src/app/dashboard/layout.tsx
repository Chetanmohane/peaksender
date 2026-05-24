'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';

const NAV_LINKS = [
  { href: '/dashboard',               icon: '🛒', label: 'New Order' },
  { href: '/dashboard/mass-order',    icon: '📦', label: 'Mass Order' },
  { href: '/dashboard/orders',        icon: '📋', label: 'Order History' },
  { href: '/dashboard/subscriptions', icon: '🔄', label: 'Subscriptions' },
  { href: '/dashboard/services',      icon: '💎', label: 'Services' },
  { href: '/dashboard/add-funds',     icon: '💰', label: 'Add Funds' },
  { href: '/api-docs',                icon: '⚙️',  label: 'API' },
  { href: '/dashboard/child-panel',   icon: '🚀', label: 'Child Panel' },
  { href: '/dashboard/affiliates',    icon: '🤝', label: 'Affiliates' },
  { href: '/dashboard/tickets',       icon: '🎧', label: 'Tickets' },
  { href: '/dashboard/profile',       icon: '👤', label: 'Account Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [balance, setBalance]       = useState<number>(12500.00);
  const [username, setUsername]     = useState('John Doe');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const savedBalance = localStorage.getItem('peaksender_balance');
      if (savedBalance === null) {
        localStorage.setItem('peaksender_balance', '12500.00');
        setBalance(12500.00);
      } else {
        setBalance(parseFloat(savedBalance));
      }
      const savedProfile = localStorage.getItem('peaksender_profile');
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          if (p.name) setUsername(p.name);
        } catch (e) { console.error(e); }
      }
    }, 0);

    const sync = () => {
      const b = localStorage.getItem('peaksender_balance');
      if (b) setBalance(parseFloat(b));
      const p = localStorage.getItem('peaksender_profile');
      if (p) { try { const pr = JSON.parse(p); if (pr.name) setUsername(pr.name); } catch (e) { console.error(e); } }
    };

    window.addEventListener('storage', sync);
    window.addEventListener('peaksender_balance_update', sync);
    window.addEventListener('peaksender_profile_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('peaksender_balance_update', sync);
      window.removeEventListener('peaksender_profile_update', sync);
    };
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const isActive = (href: string) => pathname === href;
  const closeSidebar = () => setSidebarOpen(false);

  /* Renders nav links — reused for both desktop and mobile drawers */
  const navItems = (onLinkClick?: () => void) =>
    NAV_LINKS.map(({ href, icon, label }) => (
      <Link
        key={href}
        href={href}
        className={`${styles.navLink} ${isActive(href) ? styles.active : ''}`}
        onClick={onLinkClick}
      >
        <span className={styles.icon}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
      </Link>
    ));

  /* Shared sidebar inner content */
  const sidebarInner = (onLinkClick?: () => void) => (
    <>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo} onClick={onLinkClick}>
          <span className="text-gradient">Peak</span>Sender
        </Link>
        <div className={styles.adminBadge}>
          <Link href="/admin" className={styles.adminLink} onClick={onLinkClick}>
            🔑 Open Admin Panel
          </Link>
        </div>
      </div>
      <nav className={styles.nav}>{navItems(onLinkClick)}</nav>
      <div className={styles.sidebarFooter}>
        <Link href="/auth/login" className={styles.logoutBtn} onClick={onLinkClick}>
          🚪 Logout
        </Link>
      </div>
    </>
  );

  return (
    <div className={styles.layout}>

      {/* ── Desktop Sidebar ── */}
      <aside className={`${styles.sidebar} glass`}>
        {sidebarInner()}
      </aside>

      {/* ── Mobile Backdrop (always in DOM, opacity-toggled) ── */}
      <div
        className={`${styles.mobileBackdrop} ${sidebarOpen ? styles.mobileBackdropVisible : ''}`}
        onClick={closeSidebar}
      />

      {/* ── Mobile Sidebar Drawer (always in DOM, transform-toggled) ── */}
      <aside
        className={`${styles.mobileSidebar} glass ${sidebarOpen ? styles.mobileSidebarOpen : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <div className={styles.mobileSidebarClose}>
          <button onClick={closeSidebar} className={styles.closeBtn} aria-label="Close menu">✕</button>
        </div>
        {sidebarInner(closeSidebar)}
      </aside>

      {/* ── Main Content ── */}
      <div className={styles.main}>
        <header className={`${styles.header} glass`}>
          {/* Hamburger — only visible on mobile via CSS */}
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={styles.headerTitle}>Dashboard</div>

          <div className={styles.userStats}>
            <div className={styles.stat}>
              <span className={styles.label}>Balance:</span>
              <span className={styles.value}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{getInitials(username)}</div>
              <span className={styles.userName}>{username}</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
