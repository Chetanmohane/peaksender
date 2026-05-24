'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to dashboard on success
        router.push('/dashboard');
      } else {
        setError(data.error || 'Something went wrong');
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
          <h1>Create Account</h1>
          <p>Join the best SMM platform today</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              name="username"
              type="text" 
              placeholder="Choose a username" 
              className="glass" 
              required
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              name="email"
              type="email" 
              placeholder="email@example.com" 
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
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              className="glass" 
              required
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.terms}>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the <Link href="/terms">Terms & Conditions</Link></label>
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Already have an account? <Link href="/auth/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
