import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowToCreate from '@/components/HowToCreate';
import ServiceSlider from '@/components/ServiceSlider';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <HowToCreate />
      <ServiceSlider />
      <Features />
      
      <section className={styles.cta}>
        <div className={`${styles.ctaBox} glass animate-fade`}>
          <h2>Ready to skyrocket your growth?</h2>
          <p>Join over 50,000 satisfied customers and start your journey today.</p>
          <a href="/auth/register" className={styles.ctaBtn}>Create Free Account</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
