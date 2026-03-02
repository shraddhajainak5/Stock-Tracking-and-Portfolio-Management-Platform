// src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">StockWise Trading</h5>
            <p>
              Your trusted platform for stock trading and investment management. 
              Access real-time market data, execute trades with confidence, and 
              grow your portfolio with StockWise.
            </p>
            <div className="social-links mt-4">
              <a href="https://facebook.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="https://twitter.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="https://linkedin.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a href="https://instagram.com" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram fs-5"></i>
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Quick Links</h5>
            <ListGroup className="list-unstyled footer-links">
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/" className="text-white text-decoration-none">Home</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/stocks" className="text-white text-decoration-none">Stocks</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/news" className="text-white text-decoration-none">Market News</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/about" className="text-white text-decoration-none">About Us</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent">
                <Link to="/contact" className="text-white text-decoration-none">Contact</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Resources</h5>
            <ListGroup className="list-unstyled footer-links">
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/help" className="text-white text-decoration-none">Help Center</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/faq" className="text-white text-decoration-none">FAQ</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/blog" className="text-white text-decoration-none">Blog</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent mb-2">
                <Link to="/tutorials" className="text-white text-decoration-none">Tutorials</Link>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 p-0 bg-transparent">
                <Link to="/glossary" className="text-white text-decoration-none">Glossary</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          
          <Col lg={4} md={6}>
            <h5 className="text-uppercase mb-4">Contact Us</h5>
            <p className="mb-2">
              <i className="bi bi-geo-alt-fill me-2"></i>
              123 Trading Street, Financial District, New York, NY 10001
            </p>
            <p className="mb-2">
              <i className="bi bi-envelope-fill me-2"></i>
              <a href="mailto:info@stockwise.com" className="text-white text-decoration-none">
                info@stockwise.com
              </a>
            </p>
            <p className="mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:+12125551234" className="text-white text-decoration-none">
                (212) 555-1234
              </a>
            </p>
            <p>
              <i className="bi bi-clock-fill me-2"></i>
              Support Hours: 24/7
            </p>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row className="align-items-center">
          <Col md={8} className="mb-3 mb-md-0">
            <p className="small mb-0">
              &copy; {currentYear} StockWise Trading. All rights reserved.
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <Link to="/terms" className="text-white text-decoration-none me-3 small">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-white text-decoration-none small">
              Privacy Policy
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;