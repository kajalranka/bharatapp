import React, { useState, useEffect } from 'react';
import { MapPin, Shield, CreditCard, Menu, X, ChevronRight, Star, Users, Clock } from 'lucide-react';
import styles from './css/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MapPin,
      title: "Find parking instantly",
      description: "Discover available parking spots in your area with real-time updates and location-based suggestions.",
      gradient: "blueToTeal"
    },
    {
      icon: Shield,
      title: "Secure reservations",
      description: "Book your spot in advance and secure hassle-free parking before you arrive at your destination.",
      gradient: "purpleToPink"
    },
    {
      icon: CreditCard,
      title: "Cashless payments",
      description: "Easily pay for your parking through the app with a variety of payment options for a smooth experience.",
      gradient: "greenToEmerald"
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Active Users" },
    { icon: MapPin, value: "1000+", label: "Parking Spots" },
    { icon: Star, value: "4.8", label: "App Rating" },
    { icon: Clock, value: "24/7", label: "Support" }
  ];

  const handleSignIn = () =>{
    navigate('/signup');
  }
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={`${styles.backgroundCircle} ${styles.topRight}`}></div>
        <div className={`${styles.backgroundCircle} ${styles.bottomLeft}`}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <MapPin className={styles.logoIconSvg} />
            </div>
            <span className={styles.logoText}>BharatApp</span>
          </div>

          {/* Desktop Navigation */}
          <div className={`${styles.desktopNav} navigation`}>
            <button onClick={() => handleScrollTo('About')} className={styles.navLink}>About</button>
            <button onClick={() => handleScrollTo('Features')} className={styles.navLink}>Features</button>
            <button onClick={() => handleScrollTo('Contact')} className={styles.navLink}>Contact</button>

            <button onClick={handleSignIn} className={styles.signInBtn}>
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className={styles.menuIcon} /> : <Menu className={styles.menuIcon} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
              <button onClick={() => handleScrollTo('About')} className={styles.navLink}>About</button>
              <button onClick={() => handleScrollTo('Features')} className={styles.navLink}>Features</button>
              <button onClick={() => handleScrollTo('Contact')} className={styles.navLink}>Contact</button>

            <button onClick={handleSignIn} className={styles.signInBtn}>
              Sign In
            </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles.heroTitle}>
              Find parking
              <span className={styles.heroTitleGradient}>
                instantly.
              </span>
            </h1>
            <p className={styles.heroDescription}>
              Discover available parking spots in your area with real-time updates and location-based suggestions.
            </p>
            <button className={styles.heroButton}>
              <span>Get the App</span>
              <ChevronRight className={styles.heroButtonIcon} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} id='About'>
        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${styles.statItem} ${isVisible ? styles.visible : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={styles.statIcon}>
                  <stat.icon className={styles.statIconSvg} />
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='Features' className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${styles.featureCard} ${isVisible ? styles.visible : ''}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={styles.featureCardOverlay}></div>
                <div className={styles.featureCardContent}>
                  <div className={`${styles.featureIcon} ${styles[feature.gradient]}`}>
                    <feature.icon className={styles.featureIconSvg} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Start hassle-free parking now
            </h2>
            <p className={styles.ctaDescription}>
              Download BharatApp to reserve your spot instantly.
            </p>
            <button className={styles.ctaButton}>
              <span>Get the App</span>
              <ChevronRight className={styles.ctaButtonIcon} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
  <div className={styles.footerContainer}>
    <div className={styles.footerGrid}>
      <div className={styles.footerBrand}>
        <div className={styles.footerLogo}>
          <div className={styles.footerLogoIcon}>
            <MapPin className={styles.footerLogoIconSvg} />
          </div>
          <span className={styles.footerLogoText}>BharatApp</span>
        </div>
        <p className={styles.footerBrandDescription}>Smart parking solutions for modern cities.</p>
      </div>
      
      <div className={styles.footerColumn}>
        <h4 className={styles.footerColumnTitle}>Company</h4>
        <div className={styles.footerColumnLinks}>
          <a href="#" className={styles.footerLink}>About</a>
          <a href="#" className={styles.footerLink}>Careers</a>
          <a href="#" className={styles.footerLink}>Blog</a>
        </div>
      </div>
      
      <div className={styles.footerColumn}>
        <h4 className={styles.footerColumnTitle}>Support</h4>
        <div className={styles.footerColumnLinks}>
          <a href="#" className={styles.footerLink}>FAQ</a>
          <a href="#" className={styles.footerLink}>Help Center</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Privacy</a>
        </div>
      </div>
      
      <div className={styles.footerColumn}>
        <h4 className={styles.footerColumnTitle}>Contact</h4>
        <div className={styles.footerColumnLinks}>
          <a href="mailto:support@bharatapp.com" className={styles.footerLink}>support@bharatapp.com</a>
          <a href="tel:+911234567890" className={styles.footerLink}>+91 12345 67890</a>
          <div className={styles.footerAddress}>
            <span className={styles.footerLink}>
              Mumbai, Maharashtra 400001<br />
              India
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div className={styles.footerBottom}>
      <p>&copy; 2025 BharatApp. All rights reserved.</p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default LandingPage;