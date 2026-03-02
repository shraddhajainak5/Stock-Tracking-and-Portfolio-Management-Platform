// src/config/themeConfig.js

const themeConfig = {
  light: {
    primary: '#1E88E5',
    secondary: '#00ACC1',
    accent: '#43A047',
    danger: '#E53935',
    neutralBg: '#F9FAFB',
    card: '#FFFFFF',
    textPrimary: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0'
  }
  // Dark theme removed
};

// Always return light theme
const detectColorScheme = () => {
  return 'light';
};

// Set theme in localStorage but always use light
const setThemePreference = () => {
  localStorage.setItem('stockwise-theme', 'light');
  applyTheme('light');
};

// Apply theme to document - only applies light theme
const applyTheme = () => {
  const root = document.documentElement;
  const colors = themeConfig.light;
  
  // Set CSS variables
  Object.keys(colors).forEach(key => {
    root.style.setProperty(`--${key}`, colors[key]);
  });
  
  // Set data-theme attribute
  document.body.setAttribute('data-theme', 'light');
  
  // Remove dark class if present
  document.body.classList.remove('dark-theme');
};

// Initialize theme - only initializes light theme
const initTheme = () => {
  applyTheme();
  
  // Remove listener for system preference changes
  // No need to listen for changes as we always use light theme
};

export { themeConfig, detectColorScheme, setThemePreference, applyTheme, initTheme };