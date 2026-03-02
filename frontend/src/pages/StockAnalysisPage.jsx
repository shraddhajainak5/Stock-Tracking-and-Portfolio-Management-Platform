// src/pages/StockAnalysisPage.jsx
import React from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Badge } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';

// Import components
import StockNavbar from '../components/stocks/StockNavbar';
import StockCharts from '../components/stocks/StockCharts';
import TechnicalIndicators from '../components/stocks/TechnicalIndicators';
import MarketInsights from '../components/stocks/MarketInsights';
import StockDashboard from '../components/stocks/StockDashboard';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const StockAnalysisPage = () => {
  const { symbol = 'AAPL' } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'charts';
  
  return (
    <div className="stock-analysis-page">
      {/* Main Navbar */}
      <Navbar />
      
      {/* Stock Analysis Navbar - This contains the main functionality */}
      <StockNavbar />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Alternative version if you prefer using tabs rather than the full navbar
const StockAnalysisTabsPage = () => {
  const { symbol = 'AAPL' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'charts';
  
  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };
  
  return (
    <div className="stock-analysis-page">
      {/* Main Navbar */}
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Stock Analysis: {symbol}</h2>
          <Badge bg="primary" className="fs-6">Market {Math.random() > 0.5 ? 'Open' : 'Closed'}</Badge>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="mb-4"
        >
          <Tab eventKey="charts" title="Charts">
            <Card>
              <Card.Body>
                <StockCharts symbol={symbol} />
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="technical" title="Technical Analysis">
            <TechnicalIndicators symbol={symbol} />
          </Tab>
          
          <Tab eventKey="market" title="Market Insights">
            <MarketInsights />
          </Tab>
          
          <Tab eventKey="dashboard" title="Dashboard">
            <StockDashboard symbol={symbol} />
          </Tab>
        </Tabs>
      </Container>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Using individual components example
const StockAnalysisCustomPage = () => {
  const { symbol = 'AAPL' } = useParams();
  
  return (
    <div className="stock-analysis-page">
      {/* Main Navbar */}
      <Navbar />
      
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Price Charts - {symbol}</Card.Title>
                <StockCharts symbol={symbol} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Technical Analysis</Card.Title>
                <TechnicalIndicators symbol={symbol} />
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Market Overview</Card.Title>
                <MarketInsights />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Export the main version
export default StockAnalysisPage;

// Also export alternative versions for flexibility
export { StockAnalysisTabsPage, StockAnalysisCustomPage };