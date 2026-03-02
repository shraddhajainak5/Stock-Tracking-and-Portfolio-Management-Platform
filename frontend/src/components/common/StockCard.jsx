// src/components/common/StockCard.jsx

import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const StockCard = ({ stock }) => {
  // Handle undefined or null stock data
  if (!stock) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <p className="text-center text-muted">Stock data unavailable</p>
        </Card.Body>
      </Card>
    );
  }
  
  const { id, symbol, name, price, change, percentChange } = stock;
  const isPositive = percentChange >= 0;

  return (
    <Card className="h-100 shadow-sm hover-effect">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Link to={`/stocks/${symbol}`} className="text-decoration-none">
            <h5 className="mb-0 stock-symbol">{symbol}</h5>
          </Link>
          <Badge bg={isPositive ? 'success' : 'danger'} className="price-change">
            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
          </Badge>
        </div>
        
        <Card.Subtitle className="mb-3 text-muted company-name">{name}</Card.Subtitle>
        
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <div className="fs-4 fw-bold stock-price">${typeof price === 'number' ? price.toFixed(2) : 'N/A'}</div>
            <div className={`small ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : 'N/A'}
            </div>
          </div>
          <Link to={`/stocks/${symbol}`} className="btn btn-sm btn-outline-primary">
            Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StockCard;