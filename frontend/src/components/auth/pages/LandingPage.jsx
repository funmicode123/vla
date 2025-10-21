import React from 'react';
import styles from '../../auth/pages/LandingPage.module.css';
import { ArrowRight } from 'lucide-react';
import Image from '@/assets/virtual-hero.jpeg';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSession = () => {
    navigate('/login');
  };

  const handleJoinSession = () => {
    navigate('/signup');
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Learn Anywhere, Anytime with Our Virtual Learning Platform
          </h1>
          <p className={styles.heroText}>
            Join interactive sessions, get real-time feedback, and track your learning progress—all in one platform designed for modern learners.
          </p>
          <button className={styles.ctaButton} onClick={handleSession}>
            Get Started
            <ArrowRight className={styles.ctaIcon} />
          </button>
        </div>
        <img
          src={Image}
          alt="Virtual Learning"
          className={styles.heroImage}
        />
      </section>

      <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why Choose Us</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Real-time Interaction</h3>
            <p>Engage with instructors and peers live through video, audio, and chat.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>AI-Powered Attention Tracking</h3>
            <p>Stay focused with AI that gently nudges you when your attention drops or you switch tabs.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Progress Analytics</h3>
            <p>Track your learning journey with visual analytics and session logs that show your engagement levels over time.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to Start Learning?</h2>
        <p className={styles.ctaText}>
          Sign up now to access your first session and start exploring a smarter way to learn.
        </p>
        <button className={styles.ctaButton} onClick={handleJoinSession}>
          Join Now
        </button>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Virtual Learning App. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
