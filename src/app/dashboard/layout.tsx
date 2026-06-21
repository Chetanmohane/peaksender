'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';

const NAV_LINKS = [
  // Primary Options (Upper)
  { href: '/dashboard',               icon: '🛒', label: 'New Order' },
  { href: '/dashboard/orders',        icon: '📋', label: 'Order History' },
  { href: '/dashboard/services',      icon: '💎', label: 'Services' },
  { href: '/dashboard/add-funds',     icon: '💰', label: 'Add Funds' },
  
  // Secondary Options (Lower)
  { href: '/dashboard/mass-order',    icon: '📦', label: 'Mass Order' },
  { href: '/dashboard/subscriptions', icon: '🔄', label: 'Subscriptions' },
  { href: '/dashboard/api',           icon: '⚙️',  label: 'API' },
  { href: '/dashboard/child-panel',   icon: '🚀', label: 'Child Panel' },
  { href: '/dashboard/affiliates',    icon: '🤝', label: 'Affiliates' },
  { href: '/dashboard/tickets',       icon: '🎧', label: 'Tickets' },
  { href: '/dashboard/profile',       icon: '👤', label: 'Account Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [balance, setBalance]       = useState<number>(0.00);
  const [username, setUsername]     = useState('John Doe');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [theme, setTheme]             = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('peaksender_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    return () => {
      document.documentElement.setAttribute('data-theme', 'dark');
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('peaksender_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const fetchUserStats = async (uname: string) => {
      try {
        const res = await fetch(`/api/user/stats?username=${encodeURIComponent(uname)}`);
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('peaksender_balance', data.balance.toString());
          localStorage.setItem('peaksender_total_orders', data.totalOrders.toString());
          setBalance(data.balance);
          // Dispatch storage event to trigger other active components/pages
          window.dispatchEvent(new Event('peaksender_balance_update'));
        }
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };

    setTimeout(() => {
      const savedBalance = localStorage.getItem('peaksender_balance');
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }
      const savedProfile = localStorage.getItem('peaksender_profile');
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          if (p.name) {
            setUsername(p.name);
            fetchUserStats(p.name);
          }
          setIsAdmin(p.email === 'peaksender27@gmail.com');
        } catch (e) { console.error(e); }
      }
    }, 0);

    const sync = () => {
      const b = localStorage.getItem('peaksender_balance');
      if (b) setBalance(parseFloat(b));
      const p = localStorage.getItem('peaksender_profile');
      if (p) {
        try {
          const pr = JSON.parse(p);
          if (pr.name) setUsername(pr.name);
          setIsAdmin(pr.email === 'peaksender27@gmail.com');
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsAdmin(false);
      }
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
    NAV_LINKS.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
        onClick={onLinkClick}
      >
        <span className={styles.icon}>{link.icon}</span>
        <span className={styles.navLabel}>{link.label}</span>
      </Link>
    ));

  /* Shared sidebar inner content */
  const sidebarInner = (onLinkClick?: () => void) => (
    <>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo} onClick={onLinkClick}>
          <span className="text-gradient">The Peak</span> SMM
        </Link>
        {isAdmin && (
          <div className={styles.adminBadge}>
            <Link href="/admin" className={styles.adminLink} onClick={onLinkClick}>
              🔑 Open Admin Panel
            </Link>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems(onLinkClick)}
      </nav>
      <div className={styles.sidebarFooter}>
        <Link href="/auth/login" className={styles.logoutBtn} onClick={onLinkClick}>
          🚪 Logout
        </Link>
      </div>
    </>
  );

  return (
    <div className={styles.layout}>
      {/* Premium Background Ambient Elements */}
      <div className={styles.gridOverlay} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.floatingShape1} />
      <div className={styles.floatingShape2} />
      <div className={styles.floatingShape3} />

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

          <div className={styles.headerTitle}>
            {(() => {
              switch (pathname) {
                case '/dashboard':
                  return 'New Order';
                case '/dashboard/orders':
                  return 'Order History';
                case '/dashboard/services':
                  return 'Services';
                case '/dashboard/add-funds':
                  return 'Add Funds';
                case '/dashboard/mass-order':
                  return 'Mass Order';
                case '/dashboard/subscriptions':
                  return 'Subscriptions';
                case '/dashboard/api':
                  return 'API Documentation';
                case '/dashboard/child-panel':
                  return 'Child Panel';
                case '/dashboard/affiliates':
                  return 'Affiliates';
                case '/dashboard/tickets':
                  return 'Tickets';
                case '/dashboard/profile':
                  return 'Account Settings';
                default:
                  return 'Dashboard';
              }
            })()}
          </div>

          <div className={styles.userStats}>
            <button 
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
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
