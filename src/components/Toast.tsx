'use client';

import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

// Global helper function to trigger toasts easily from any file
export const showToast = (type: ToastType, message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('peaksender_toast', {
        detail: { type, message }
      })
    );
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: ToastType; message: string }>;
      const { type, message } = customEvent.detail;
      
      // Prevent duplicate identical toasts in quick succession
      setToasts((prev) => {
        if (prev.some((t) => t.message === message)) return prev;
        
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastItem = { id, type, message };
        
        // Auto remove after 4.5 seconds
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== id));
        }, 4500);

        return [...prev, newToast];
      });
    };

    window.addEventListener('peaksender_toast', handleToastEvent);
    return () => {
      window.removeEventListener('peaksender_toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`${styles.toast} ${styles[t.type]} glass`}
        >
          <div className={styles.icon}>
            {t.type === 'success' && '✅'}
            {t.type === 'error' && '❌'}
            {t.type === 'info' && 'ℹ️'}
          </div>
          <div className={styles.content}>
            <p className={styles.message}>{t.message}</p>
          </div>
          <button className={styles.closeBtn} onClick={() => removeToast(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
