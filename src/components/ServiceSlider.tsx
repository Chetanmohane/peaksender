import React from 'react';
import styles from './ServiceSlider.module.css';

const services = [
  'Instagram Followers', 'YouTube Views', 'TikTok Likes', 
  'Facebook Ads', 'Twitter Retweets', 'Spotify Plays',
  'Telegram Members', 'LinkedIn Connections'
];

const ServiceSlider = () => {
  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderTrack}>
        {/* Double the array for seamless infinite scroll */}
        {[...services, ...services].map((service, index) => (
          <div key={index} className={`${styles.slide} glass`}>
            <span>⚡</span> {service}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSlider;
