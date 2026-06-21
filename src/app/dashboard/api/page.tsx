'use client';

import React from 'react';
import styles from '../dashboard.module.css';

const DashboardAPIDocsPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.orderCard} glass animate-fade`} style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>API Documentation</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Integrate PeakSender services into your own platform with our powerful API.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>HTTP Method</h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: 'var(--foreground)',
              border: '1px solid var(--card-border)'
            }}>
              POST
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>API URL</h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: 'var(--foreground)',
              border: '1px solid var(--card-border)'
            }}>
              https://thepeaksmm.shop/api/v2
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Parameters</h3>
            <div className={styles.tableWrapper} style={{ overflowX: 'auto', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
              <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Parameter</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>key</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Your API Key</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>action</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>add, status, services, balance</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>service</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Service ID</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>link</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Link to the profile/post</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>quantity</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Desired quantity</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Example Response (Order Success)</h3>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1.5rem',
              borderRadius: '12px',
              color: 'var(--foreground)',
              overflowX: 'auto',
              border: '1px solid var(--card-border)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              margin: 0
            }}>
{`{
  "order": 12345,
  "status": "success"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAPIDocsPage;
