'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        const profile = { 
          name: data.user.name, 
          email: data.user.email,
          role: data.user.role 
        };
        localStorage.setItem('peaksender_profile', JSON.stringify(profile));
        localStorage.setItem('peaksender_balance', data.user.balance.toString());
        window.dispatchEvent(new Event('peaksender_profile_update'));
        window.dispatchEvent(new Event('peaksender_balance_update'));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.authContainer}>
      <Link href="/" className={styles.backHomeBtn}>
        ← Back to Website
      </Link>

      {/* Premium background layout elements */}
      <div className={styles.gridOverlay} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.floatingShape1} />
      <div className={styles.floatingShape2} />

      <div className={`${styles.authCard} glass`}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className="text-gradient">The Peak</span> SMM
          </Link>
          <h1>Welcome Back</h1>
          <p>Login to your account to continue</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Username or Email</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input 
                name="username"
                type="text" 
                placeholder="Enter your username" 
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ margin: 0 }}>Password</label>
              <Link href="/auth/forgot" className={styles.forgot}>Forgot Password?</Link>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                required
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className={styles.remember}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button 
            type="button" 
            className={styles.guestBtn}
            onClick={() => router.push('/dashboard')}
          >
            Guest Demo Login
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Don&apos;t have an account? <Link href="/auth/register">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
