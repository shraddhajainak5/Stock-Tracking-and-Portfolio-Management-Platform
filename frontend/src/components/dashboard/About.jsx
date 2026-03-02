import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from "../common/Navbar";
import Footer from '../common/Footer';

const styles = {
  root: {
    '--primary': '#1E88E5',
    '--primary-light': '#90CAF9',
    '--secondary': '#00ACC1',
    '--secondary-light': '#80DEEA',
    '--accent': '#43A047',
    '--accent-light': '#A5D6A7',
    '--danger': '#E53935',
    '--danger-light': '#EF9A9A',
    '--neutral-bg': '#F9FAFB',
    '--card-bg': '#FFFFFF',
    '--text-primary': '#212121',
    '--text-secondary': '#757575',
    '--border': '#E0E0E0',
    fontFamily: "'Inter', sans-serif",
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  subheading: {
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--primary)',
    fontWeight: 500,
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: '4rem',
  },
  primaryBtn: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(30, 136, 229, 0.2)',
    padding: '0.6rem 1.5rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'var(--primary)',
      borderColor: 'var(--primary)',
      boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
      transform: 'translateY(-2px)',
    },
  },
  formControl: {
    borderRadius: '8px',
    borderColor: 'var(--border)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    '&:focus': {
      borderColor: 'var(--primary-light)',
      boxShadow: '0 0 0 0.25rem rgba(30, 136, 229, 0.25)',
    },
  },
  sectionHeader: {
    position: 'relative',
    marginBottom: '2.5rem',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-10px',
      left: '0',
      width: '60px',
      height: '3px',
      backgroundColor: 'var(--primary)',
      borderRadius: '3px',
    }
  },
  teamCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
    },
  },
  teamImage: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
  },
  featureIcon: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: '12px',
    fontSize: '1.5rem',
    marginBottom: '1.25rem',
  },
  footer: {
    backgroundColor: '#1A237E', // Dark blue footer
    color: 'white',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
    '&:hover': {
      color: 'white',
      textDecoration: 'none',
    },
  },
};

const About = () => {
  return (
    <div style={styles.root} className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1" style={{ backgroundColor: 'var(--neutral-bg)' }}>
        {/* Hero Section */}
        <div className="py-5" style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: 'white'
        }}>
          <div className="container py-4">
            <div className="row justify-content-center align-items-center">
              <div className="col-lg-6">
                <h1 style={{ 
                  ...styles.heading, 
                  fontSize: '2.75rem', 
                  color: 'white', 
                  marginBottom: '1.5rem' 
                }}>
                  About StockWise
                </h1>
                <p className="lead mb-4">
                  We're on a mission to democratize financial information and empower investors 
                  of all experience levels to make smarter decisions.
                </p>
              </div>
              {/* <div className="col-lg-6 d-none d-lg-block">
                <img 
                  src="/assets/stock-analysis.svg" 
                  alt="Financial analysis" 
                  className="img-fluid" 
                />
              </div> */}
            </div>
          </div>
        </div>

        <div className="container py-5" id="our_mission">
          <section style={styles.section}>
            <h2 style={{ ...styles.heading, ...styles.sectionHeader }}>Our Mission</h2>
            <div className="row">
              <div className="col-lg-8">
                <p className="lead" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                  At StockWise, we're dedicated to democratizing financial information and helping investors make informed decisions. 
                  Our platform combines real-time market data, intuitive portfolio management tools, and AI-powered insights 
                  to provide a comprehensive financial management experience for investors of all levels.
                </p>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section style={styles.section}>
            <h2 style={{ ...styles.heading, ...styles.sectionHeader }}>Our Story</h2>
            <div className="row align-items-center g-4">
              <div className="col-md-7">
                <p style={{ color: 'var(--text-secondary)' }}>
                  Founded in 2022, StockWise began with a simple observation: financial data was abundant but 
                  not accessible to everyday investors. Our founders, a team of financial analysts and software engineers, 
                  set out to create a platform that would bridge this gap by transforming complex market data into 
                  actionable insights.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Since then, we've grown to serve over 100,000 users worldwide, from individual retail investors 
                  to professional money managers. Our commitment to innovation and user-centered design has made 
                  StockWise a trusted name in financial technology.
                </p>
                <div className="d-flex align-items-center mt-4">
                  <div className="me-4">
                    <div style={{ color: 'var(--accent)', fontSize: '2.5rem', fontWeight: 'bold' }}>100K+</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Active Users</div>
                  </div>
                  <div className="me-4">
                    <div style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 'bold' }}>50M+</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Transactions</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--secondary)', fontSize: '2.5rem', fontWeight: 'bold' }}>150+</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Countries</div>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div style={{ ...styles.card, padding: '10px', transform: 'rotate(2deg)' }}>
                  <img 
                    src="assets/team.jpg" 
                    alt="StockWise team" 
                    className="img-fluid rounded" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Our Approach */}
          <section style={styles.section}>
            <h2 style={{ ...styles.heading, ...styles.sectionHeader }}>Our Approach</h2>
            <div className="row row-cols-1 row-cols-md-3 g-4">
              <div className="col">
                <div style={styles.card} className="card h-100 p-4">
                  <div style={styles.featureIcon}>
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h4 style={{ ...styles.heading, fontSize: '1.25rem' }}>Data-Driven Insights</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    We process millions of data points daily to provide you with actionable market intelligence and personalized recommendations.
                  </p>
                </div>
              </div>
              <div className="col">
                <div style={styles.card} className="card h-100 p-4">
                  <div style={styles.featureIcon}>
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h4 style={{ ...styles.heading, fontSize: '1.25rem' }}>Security First</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Your data and financial information are protected with enterprise-grade security and encryption.
                  </p>
                </div>
              </div>
              <div className="col">
                <div style={styles.card} className="card h-100 p-4">
                  <div style={styles.featureIcon}>
                    <i className="bi bi-lightning"></i>
                  </div>
                  <h4 style={{ ...styles.heading, fontSize: '1.25rem' }}>Continuous Innovation</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    We're constantly evolving our platform with new features and improvements based on user feedback and market trends.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Team */}
          <section style={styles.section}>
            <h2 style={{ ...styles.heading, ...styles.sectionHeader }}>Leadership Team</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div style={styles.teamCard} className="card border-0">
                  <img 
                    src="assets/Sarah.jpg" 
                    alt="Sarah Johnson" 
                    style={styles.teamImage}
                  />
                  <div className="card-body p-4">
                    <h5 style={{ ...styles.heading, fontSize: '1.25rem' }}>Sarah Johnson</h5>
                    <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>Chief Executive Officer</p>
                    <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                      Former investment banker with 15+ years of experience in financial markets and fintech innovation.
                    </p>
                    <div className="mt-3">
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-linkedin fs-5"></i></a>
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-twitter fs-5"></i></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.teamCard} className="card border-0">
                  <img 
                    src="assets/Michael.jpg" 
                    alt="Michael Chen" 
                    style={styles.teamImage}
                  />
                  <div className="card-body p-4">
                    <h5 style={{ ...styles.heading, fontSize: '1.25rem' }}>Michael Chen</h5>
                    <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>Chief Technology Officer</p>
                    <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                      Tech veteran who previously led engineering teams at several successful financial technology startups.
                    </p>
                    <div className="mt-3">
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-linkedin fs-5"></i></a>
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-github fs-5"></i></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.teamCard} className="card border-0">
                  <img 
                    src="assets/Alex.webp" 
                    alt="Alex Rodriguez" 
                    style={styles.teamImage}
                  />
                  <div className="card-body p-4">
                    <h5 style={{ ...styles.heading, fontSize: '1.25rem' }}>Alex Rodriguez</h5>
                    <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>Chief Financial Officer</p>
                    <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                      Seasoned financial strategist with expertise in scaling fintech businesses and optimizing capital allocation.
                    </p>
                    <div className="mt-3">
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-linkedin fs-5"></i></a>
                      <a href="#" className="me-2" style={{ color: 'var(--primary)' }}><i className="bi bi-twitter fs-5"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;