// src/config/constants.js

// API URL
export const API_URL = 'http://localhost:3000';

// Chart Periods
export const CHART_PERIODS = {
  DAY: '1D',
  WEEK: '1W',
  MONTH: '1M',
  THREE_MONTHS: '3M',
  YEAR: '1Y',
  ALL: 'ALL'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Stock Types
export const STOCK_TYPES = {
  EQUITY: 'equity',
  ETF: 'etf',
  INDEX: 'index',
  CRYPTO: 'crypto',
  FOREX: 'forex'
};

// Order Types
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit'
};

// Transaction Types
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};

// User Types
export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'stockwise_token',
  USER: 'stockwise_user',
  THEME: 'stockwise_theme'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};