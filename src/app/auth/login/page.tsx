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
      <div className={`${styles.authCard} glass animate-fade`}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className="text-gradient">Peak</span>Sender
          </Link>
          <h1>Welcome Back</h1>
          <p>Login to your account to continue</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Username or Email</label>
            <input 
              name="username"
              type="text" 
              placeholder="Enter your username" 
              className="glass" 
              required
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              className="glass" 
              required
              onChange={handleChange}
            />
            <Link href="/auth/forgot" className={styles.forgot}>Forgot Password?</Link>
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
