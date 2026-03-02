import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Dropdown, Button, Spinner } from 'react-bootstrap';
import axios from "axios";
import AppNavbar from '../common/Navbar';

const MarketOverview = ({ newsData = [], isLoading = false }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [displayedNews, setDisplayedNews] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const theme = {
    light: {
      primary: '#1E88E5',
      primaryLight: '#90CAF9',
      secondary: '#00ACC1',
      secondaryLight: '#80DEEA',
      accent: '#43A047',
      accentLight: '#A5D6A7',
      danger: '#E53935',
      dangerLight: '#EF9A9A',
      neutralBg: '#F9FAFB',
      cardBg: '#FFFFFF',
      textPrimary: '#212121',
      textSecondary: '#757575',
      border: '#E0E0E0'
    },
    dark: {
      primary: '#90CAF9',
      primaryLight: '#1E88E5',
      secondary: '#80DEEA',
      secondaryLight: '#00ACC1',
      accent: '#A5D6A7',
      accentLight: '#43A047',
      danger: '#EF9A9A',
      dangerLight: '#E53935',
      neutralBg: '#121212',
      cardBg: '#1E1E1E',
      textPrimary: '#E0E0E0',
      textSecondary: '#BDBDBD',
      border: '#2E2E2E'
    }
  };
  
  // Get current theme based on mode
  const currentTheme = darkMode ? theme.dark : theme.light;

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All News', color: 'primary' },
    { id: 'markets', label: 'Markets', color: 'info' },
    { id: 'stocks', label: 'Stocks', color: 'success' },
    { id: 'economy', label: 'Economy', color: 'warning' },
    { id: 'crypto', label: 'Crypto', color: 'danger' }
  ];


  const styles = {
    container: {
      backgroundColor: currentTheme.neutralBg,
      color: currentTheme.textPrimary,
      fontFamily: "'Inter', sans-serif",
      borderRadius: '12px',
      padding: '24px',
      transition: 'all 0.3s ease'
    },
    heading: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      color: currentTheme.textPrimary,
      marginBottom: '8px'
    },
    card: {
      backgroundColor: currentTheme.cardBg,
      borderRadius: '12px',
      border: 'none',
      overflow: 'hidden',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      height: '100%'
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)'
    },
    featuredCard: {
      backgroundColor: currentTheme.cardBg,
      borderRadius: '16px',
      border: 'none',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    primaryButton: {
      backgroundColor: currentTheme.primary,
      borderColor: currentTheme.primary,
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '8px 16px',
      boxShadow: '0 2px 6px rgba(30, 136, 229, 0.3)',
      transition: 'all 0.3s ease'
    },
    primaryButtonHover: {
      backgroundColor: currentTheme.primaryLight,
      borderColor: currentTheme.primaryLight,
      boxShadow: '0 4px 12px rgba(30, 136, 229, 0.4)',
      transform: 'translateY(-2px)'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: currentTheme.primary,
      color: currentTheme.primary,
      borderRadius: '8px',
      padding: '8px 16px',
      transition: 'all 0.3s ease'
    },
    secondaryButtonHover: {
      backgroundColor: `${currentTheme.primaryLight}20`,
      boxShadow: '0 2px 8px rgba(30, 136, 229, 0.2)'
    },
    filterButton: {
      backgroundColor: 'transparent',
      borderColor: currentTheme.border,
      color: currentTheme.textSecondary,
      borderRadius: '20px',
      padding: '6px 14px',
      fontSize: '0.875rem',
      margin: '0 4px',
      transition: 'all 0.2s ease'
    },
    filterButtonActive: {
      backgroundColor: currentTheme.primary,
      borderColor: currentTheme.primary,
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
    },
    badge: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      borderRadius: '6px',
      padding: '5px 10px',
      fontSize: '0.75rem'
    },
    imageContainer: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px 8px 0 0'
    },
    imageTint: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      zIndex: 1
    },
    categoryBadge: (category) => {
      let bgColor, textColor;
      
      switch(category) {
        case 'markets':
          bgColor = '#00ACC1';
          textColor = '#FFFFFF';
          break;
        case 'stocks': 
          bgColor = '#43A047';
          textColor = '#FFFFFF';
          break;
        case 'economy':
          bgColor = '#FF9800';
          textColor = '#FFFFFF';
          break;
        case 'crypto':
          bgColor = '#E53935';
          textColor = '#FFFFFF';
          break;
        default:
          bgColor = '#1E88E5';
          textColor = '#FFFFFF';
      }
      
      return {
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '6px',
        padding: '5px 10px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-block'
      };
    },
    timestamp: {
      color: currentTheme.textSecondary,
      fontSize: '0.75rem',
      fontWeight: 500
    },
    loadMoreButton: {
      backgroundColor: 'transparent',
      borderColor: currentTheme.border,
      color: currentTheme.textSecondary,
      borderRadius: '8px',
      padding: '10px 20px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: `${currentTheme.primaryLight}10`,
        borderColor: currentTheme.primary,
        color: currentTheme.primary
      }
    },
    readMoreButton: {
      color: currentTheme.primary,
      padding: 0,
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center'
    },
    emptyStateIcon: {
      fontSize: '4rem',
      color: `${currentTheme.textSecondary}80`
    },
    newsImage: {
      height: '160px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px 8px 0 0',
      position: 'relative'
    },
    infoIcon: {
      fontSize: '1.2rem',
      color: currentTheme.textSecondary,
      marginRight: '0.5rem'
    },
    sourceTag: {
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: `${currentTheme.primaryLight}15`,
      color: currentTheme.textSecondary,
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 500
    }
  };

  // Process and filter news whenever filter or sort changes
  useEffect(() => {
    if (newsData.length === 0) return;

    let filtered = [...newsData];
    
    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(news => 
        news.categories?.includes(filter) || 
        news.title.toLowerCase().includes(filter)
      );
    }
    
    // Apply sorting
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'popular') {
      // In a real app, you'd sort by popularity/trending metrics
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    
    setDisplayedNews(filtered);
  }, [newsData, filter, sortBy]);


  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        const response = await axios.get("http://localhost:3000/market/news");
        setDisplayedNews(response.data); // adjust based on actual response structure
      } catch (error) {
        console.error("Error fetching market news:", error);
      }
    };
  
    fetchMarketNews();
  }, []);

  // Function to determine which category a news item belongs to
  const getCategoryForNews = (news) => {
    if (news.title?.toLowerCase().includes('crypto') || 
        news.summary?.toLowerCase().includes('bitcoin') || 
        news.summary?.toLowerCase().includes('ethereum')) {
      return 'crypto';
    } else if (news.title?.toLowerCase().includes('stock') || 
               news.summary?.toLowerCase().includes('shares')) {
      return 'stocks';
    } else if (news.title?.toLowerCase().includes('economy') || 
               news.summary?.toLowerCase().includes('inflation') || 
               news.summary?.toLowerCase().includes('interest rate')) {
      return 'economy';
    } else {
      return 'markets';
    }
  };

  // Function to handle expanding article details
  const toggleExpandArticle = (articleId) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
    }
  };

  // Function to open the full article in a new tab
  const openArticle = (url) => {
    window.open(url, '_blank');
  };

  // Function to format the published date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays <= 7) {
      // Within a week
      return `${diffDays} days ago`;
    } else {
      // Older than a week
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Handle card hover effect
  const [hoveredCard, setHoveredCard] = useState(null);
  
  return (
    <>
    <AppNavbar />
    <div style={styles.container}>
      {/* Header with filtering and sorting options */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={styles.heading} className="d-flex align-items-center">
            <i className="bi bi-newspaper me-2" style={{ color: currentTheme.primary }}></i>
            Market News
          </h2>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.9rem', margin: 0 }}>
            Latest updates from financial markets
          </p>
        </div>
        
        <div className="d-flex align-items-center">
          {/* Theme toggle */}
          <Button
            variant="link"
            className="me-3 p-0"
            onClick={() => setDarkMode(!darkMode)}
            style={{ color: currentTheme.textSecondary }}
          >
            {darkMode ? (
              <i className="bi bi-sun-fill" style={{ fontSize: '1.2rem' }}></i>
            ) : (
              <i className="bi bi-moon-fill" style={{ fontSize: '1.2rem' }}></i>
            )}
          </Button>
          
          {/* Category filter buttons */}
          <div className="d-none d-md-flex me-3">
            {categories.map(category => (
              <Button
                key={category.id}
                style={{
                  ...styles.filterButton,
                  ...(filter === category.id ? styles.filterButtonActive : {})
                }}
                onClick={() => setFilter(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Mobile dropdown for categories */}
          <div className="d-md-none me-2">
            <Dropdown>
              <Dropdown.Toggle 
                variant="light" 
                id="dropdown-categories"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.border,
                  color: currentTheme.textPrimary,
                  borderRadius: '8px'
                }}
              >
                <i className="bi bi-filter me-1"></i>
                {categories.find(c => c.id === filter)?.label || 'All News'}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border }}>
                {categories.map(category => (
                  <Dropdown.Item 
                    key={category.id} 
                    onClick={() => setFilter(category.id)}
                    active={filter === category.id}
                    style={{ 
                      color: filter === category.id ? currentTheme.primary : currentTheme.textPrimary,
                      backgroundColor: filter === category.id ? `${currentTheme.primaryLight}20` : 'transparent'
                    }}
                  >
                    {category.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          {/* Sort options */}
          <Dropdown>
            <Dropdown.Toggle 
              variant="light" 
              id="dropdown-sort"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.border,
                color: currentTheme.textPrimary,
                borderRadius: '8px'
              }}
            >
              <i className="bi bi-sort-down me-1"></i>
              {sortBy === 'latest' ? 'Latest' : 'Popular'}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border }}>
              <Dropdown.Item 
                onClick={() => setSortBy('latest')}
                active={sortBy === 'latest'}
                style={{ 
                  color: sortBy === 'latest' ? currentTheme.primary : currentTheme.textPrimary,
                  backgroundColor: sortBy === 'latest' ? `${currentTheme.primaryLight}20` : 'transparent'
                }}
              >
                Latest First
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => setSortBy('popular')}
                active={sortBy === 'popular'}
                style={{ 
                  color: sortBy === 'popular' ? currentTheme.primary : currentTheme.textPrimary,
                  backgroundColor: sortBy === 'popular' ? `${currentTheme.primaryLight}20` : 'transparent'
                }}
              >
                Most Popular
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      
      {/* News content */}
      {isLoading ? (
        <div className="text-center py-5" style={{ color: currentTheme.textSecondary }}>
          <div className="spinner-grow" style={{ color: currentTheme.primary, width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ fontSize: '0.9rem' }}>Loading market news...</p>
        </div>
      ) : displayedNews.length === 0 ? (
        <div style={{ ...styles.card, padding: '40px 20px' }} className="text-center">
          <i className="bi bi-inbox" style={styles.emptyStateIcon}></i>
          <h5 style={{ ...styles.heading, marginTop: '1rem' }}>No news articles found</h5>
          <p style={{ color: currentTheme.textSecondary }}>
            {filter !== 'all' 
              ? `Try changing the filter or check back later for ${categories.find(c => c.id === filter)?.label.toLowerCase()} news.` 
              : 'Check back later for the latest market updates.'}
          </p>
        </div>
      ) : (
        <Row>
          {/* Featured/Latest News (larger card) */}
          {displayedNews.length > 0 && (
            <Col lg={12} className="mb-4">
              <div 
                style={styles.featuredCard} 
                className="overflow-hidden"
                onMouseEnter={() => setHoveredCard('featured')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Row className="g-0">
                  <Col md={4}>
                    <div style={styles.imageContainer} className="h-100">
                      {displayedNews[0].image ? (
                        <>
                          <div style={styles.imageTint}></div>
                          <div 
                            className="h-100" 
                            style={{
                              backgroundImage: `url(${displayedNews[0].image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              minHeight: '260px',
                              transform: hoveredCard === 'featured' ? 'scale(1.05)' : 'scale(1)',
                              transition: 'transform 0.5s ease'
                            }}
                          ></div>
                        </>
                      ) : (
                        <div 
                          className="h-100 d-flex align-items-center justify-content-center" 
                          style={{ 
                            backgroundColor: `${currentTheme.primaryLight}20`,
                            minHeight: '260px'
                          }}
                        >
                          <i className="bi bi-newspaper" style={{ fontSize: '3rem', color: currentTheme.primary }}></i>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={8}>
                    <div style={{ padding: '24px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div style={styles.categoryBadge(getCategoryForNews(displayedNews[0]))}>
                          {categories.find(c => c.id === getCategoryForNews(displayedNews[0]))?.label || 'News'}
                        </div>
                        <div style={styles.timestamp}>
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(displayedNews[0].publishedAt)}
                        </div>
                      </div>
                      <h3 style={styles.heading} className="mb-3">{displayedNews[0].title}</h3>
                      <p style={{ color: currentTheme.textSecondary, lineHeight: '1.6' }}>
                        {displayedNews[0].summary}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div style={styles.sourceTag}>
                          Source: {displayedNews[0].source}
                        </div>
                        <Button 
                          style={{
                            ...styles.primaryButton,
                            ...(hoveredCard === 'featured' ? styles.primaryButtonHover : {})
                          }}
                          onClick={() => openArticle(displayedNews[0].url)}
                        >
                          Read Full Article <i className="bi bi-arrow-right ms-1"></i>
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          )}
          
          {/* Regular news cards */}
          {displayedNews.slice(1).map((news, index) => (
            <Col lg={6} className="mb-4" key={news.id || index}>
              <div 
                style={{
                  ...styles.card,
                  ...(hoveredCard === news.id ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(news.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {news.image && (
                  <div style={styles.imageContainer}>
                    <div style={styles.imageTint}></div>
                    <div 
                      style={{
                        ...styles.newsImage,
                        backgroundImage: `url(${news.image})`,
                        transform: hoveredCard === news.id ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.5s ease'
                      }}
                    ></div>
                  </div>
                )}
                <div style={{ padding: '20px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={styles.categoryBadge(getCategoryForNews(news))}>
                      {categories.find(c => c.id === getCategoryForNews(news))?.label || 'News'}
                    </div>
                    <div style={styles.timestamp}>
                      <i className="bi bi-clock me-1"></i>
                      {formatDate(news.publishedAt)}
                    </div>
                  </div>
                  <h5 style={styles.heading} className="mb-3">
                    {news.title}
                  </h5>
                  
                  <p style={{ 
                    color: currentTheme.textSecondary, 
                    overflow: expandedArticle === news.id ? 'visible' : 'hidden',
                    textOverflow: expandedArticle === news.id ? 'clip' : 'ellipsis',
                    display: expandedArticle === news.id ? 'block' : '-webkit-box',
                    WebkitLineClamp: expandedArticle === news.id ? 'unset' : '3',
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {news.summary}
                  </p>
                  
                  {/* Toggle expand/collapse for longer summaries */}
                  {news.summary && news.summary.length > 100 && (
                    <button 
                      style={styles.readMoreButton}
                      onClick={() => toggleExpandArticle(news.id)}
                      className="mb-3 border-0 bg-transparent"
                    >
                      {expandedArticle === news.id ? (
                        <>Show less <i className="bi bi-chevron-up ms-1"></i></>
                      ) : (
                        <>Read more <i className="bi bi-chevron-down ms-1"></i></>
                      )}
                    </button>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                    <div style={styles.sourceTag}>
                      {news.source}
                    </div>
                    <Button 
                      style={{
                        ...styles.secondaryButton,
                        ...(hoveredCard === news.id ? styles.secondaryButtonHover : {})
                      }}
                      onClick={() => openArticle(news.url)}
                    >
                      Read Article
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Load more button */}
      {displayedNews.length > 0 && (
        <div className="text-center mt-4 mb-2">
          <Button 
            style={{
              backgroundColor: `${currentTheme.primary}10`,
              color: currentTheme.primary,
              border: `1px solid ${currentTheme.primary}30`,
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
            className="px-4"
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.primary}20`;
              e.currentTarget.style.boxShadow = `0 4px 12px ${currentTheme.primary}30`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.primary}10`;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Load More News
          </Button>
        </div>
      )}
    </div>
  </>
  );
};

export default MarketOverview;