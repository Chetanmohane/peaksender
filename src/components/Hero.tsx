'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';
import { showToast } from '@/components/Toast';

const Hero = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        // Save the profile info to localStorage
        let email = formData.username;
        if (!email.includes('@')) {
          if (email.toLowerCase() === 'peaksender27') {
            email = 'peaksender27@gmail.com';
          } else {
            email = `${formData.username}@example.com`;
          }
        }
        const profile = { name: formData.username, email };
        localStorage.setItem('peaksender_profile', JSON.stringify(profile));
        
        // Save initial balance if not exists
        if (!localStorage.getItem('peaksender_balance')) {
          localStorage.setItem('peaksender_balance', data.user?.balance?.toString() || '12500.00');
        }

        window.dispatchEvent(new Event('peaksender_profile_update'));
        window.dispatchEvent(new Event('peaksender_balance_update'));

        showToast('success', 'Logged in successfully!');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
        showToast('error', data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
      showToast('error', 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.hero}>
      {/* 3D Infinite Perspective Grid */}
      <div className={styles.grid3d}></div>

      {/* 3D Rotating Cubes */}
      <div className={`${styles.cubeWrapper} ${styles.cube1} ${styles.medium}`}>
        <div className={styles.cube3d}>
          <div className={`${styles.face} ${styles.front}`}></div>
          <div className={`${styles.face} ${styles.back}`}></div>
          <div className={`${styles.face} ${styles.right}`}></div>
          <div className={`${styles.face} ${styles.left}`}></div>
          <div className={`${styles.face} ${styles.top}`}></div>
          <div className={`${styles.face} ${styles.bottom}`}></div>
        </div>
      </div>

      <div className={`${styles.cubeWrapper} ${styles.cube2} ${styles.large}`}>
        <div className={styles.cube3d}>
          <div className={`${styles.face} ${styles.front}`}></div>
          <div className={`${styles.face} ${styles.back}`}></div>
          <div className={`${styles.face} ${styles.right}`}></div>
          <div className={`${styles.face} ${styles.left}`}></div>
          <div className={`${styles.face} ${styles.top}`}></div>
          <div className={`${styles.face} ${styles.bottom}`}></div>
        </div>
      </div>

      <div className={`${styles.cubeWrapper} ${styles.cube3} ${styles.small}`}>
        <div className={styles.cube3d}>
          <div className={`${styles.face} ${styles.front}`}></div>
          <div className={`${styles.face} ${styles.back}`}></div>
          <div className={`${styles.face} ${styles.right}`}></div>
          <div className={`${styles.face} ${styles.left}`}></div>
          <div className={`${styles.face} ${styles.top}`}></div>
          <div className={`${styles.face} ${styles.bottom}`}></div>
        </div>
      </div>

      {/* Floating Emojis / Graphics */}
      <div className={`${styles.floatingElement} ${styles.emojiLeft}`}>😍</div>
      <div className={`${styles.floatingElement} ${styles.ratingRight}`}>
        <div className={styles.ratingCard}>
          <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
        </div>
      </div>
      <div className={`${styles.floatingElement} ${styles.heartLeft}`}>
        <div className={styles.heartBubble}>
          <span className={styles.heartIcon}>❤️</span>
        </div>
      </div>
      <div className={`${styles.floatingElement} ${styles.emojiRight}`}>😍</div>

      {/* Dashed Paths */}
      <div className={`${styles.dashedPath} ${styles.pathLeft}`}>
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4">
          <path d="M0,50 Q25,20 50,50 T100,50" />
        </svg>
      </div>
      <div className={`${styles.dashedPath} ${styles.pathRight}`}>
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4">
          <path d="M0,30 Q30,70 60,30 T100,60" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Headline */}
          <h1 className={styles.mainTitle}>
            <span className={styles.yellowText}>SMM</span> Panel, A <span className={styles.yellowText}>Main</span> Provider <span className={styles.yellowText}>Panel</span>
          </h1>
          <h2 className={styles.saleTitle}>
            <span className={styles.redText}>SALE</span> IS <span className={styles.whiteText}>LIVE</span>
          </h2>
          <p className={styles.subtitleText}>
            WE HAVE <span className={styles.redText}>EVERYTHING</span> YOU NEED TO RUN <span className={styles.greenText}>SUCCESSFUL</span> SOCIAL MEDIA ACCOUNTS
          </p>

          {/* Login Card */}
          <div className={styles.loginCard}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className={styles.forgotPassword}>
                <Link href="/auth/forgot">Forgot password?</Link>
              </div>

              <button type="submit" className={styles.signInBtn} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign in'}
              </button>

              <button type="button" className={styles.googleBtn} onClick={() => {
                showToast('info', 'Google Login is currently a demo feature.');
              }}>
                <span className={styles.googleIcon}>G</span> Sign in with Google
              </button>

              <div className={styles.signupLink}>
                Do not have an account? <Link href="/auth/register">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Wave Divider - Fill matches HowToCreate's dark background #08031a */}
      <div className={styles.waveDivider}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={styles.waveSvg}>
          <path d="M0,60 C360,100 720,20 1440,80 L1440,100 L0,100 Z" fill="#08031a" />
        </svg>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
        aria-label="Contact support on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className={styles.whatsappIcon}>
          <path fill="#ffffff" d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.33 4.99L2 22l5.176-1.357c1.477.808 3.137 1.233 4.832 1.233 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm3.84 14.613c-.234.664-1.156 1.223-1.879 1.352-.648.117-1.488.188-2.395-.102-.906-.289-1.805-.734-2.527-1.281-2.227-1.691-3.66-3.965-3.773-4.117-.113-.152-.926-1.238-.926-2.363 0-1.125.586-1.676.82-1.922.234-.246.516-.309.688-.309.172 0 .344.008.492.016.156.008.367-.063.578.438.219.523.75 1.828.812 1.953.063.125.102.273.016.438-.086.164-.172.289-.344.492-.172.203-.367.453-.523.609-.172.172-.352.359-.148.703.203.344.906 1.492 1.945 2.414 1.336 1.188 2.461 1.555 2.805 1.727.344.172.547.148.68-.008.133-.156.578-.672.734-.906.156-.234.313-.195.527-.117.219.078 1.383.652 1.621.77.238.117.398.176.457.277.059.102.059.59-.176 1.254z" />
        </svg>
      </a>
    </section>
  );
};

export default Hero;
