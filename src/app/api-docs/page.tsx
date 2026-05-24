import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './api-docs.module.css';

const APIDocsPage = () => {
  return (
    <main>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className="text-gradient">API Documentation</h1>
          <p>Integrate PeakSender services into your own platform with our powerful API.</p>
        </div>
      </div>

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={`${styles.docCard} glass animate-fade`}>
            <h3>HTTP Method</h3>
            <div className={styles.code}>POST</div>
            
            <h3>API URL</h3>
            <div className={styles.code}>https://peaksender.com/api/v2</div>
            
            <h3>Parameters</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>key</td>
                  <td>Your API Key</td>
                </tr>
                <tr>
                  <td>action</td>
                  <td>add, status, services, balance</td>
                </tr>
                <tr>
                  <td>service</td>
                  <td>Service ID</td>
                </tr>
                <tr>
                  <td>link</td>
                  <td>Link to the profile/post</td>
                </tr>
                <tr>
                  <td>quantity</td>
                  <td>Desired quantity</td>
                </tr>
              </tbody>
            </table>

            <h3>Example Response (Order Success)</h3>
            <pre className={styles.pre}>
{`{
  "order": 12345,
  "status": "success"
}`}
            </pre>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default APIDocsPage;
