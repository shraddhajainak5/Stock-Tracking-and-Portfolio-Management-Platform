import React, { createContext, useContext, useEffect, useState } from 'react';
import { detectColorScheme, setThemePreference, initTheme } from '../../config/themeConfig';

// Create context
const ThemeContext = createContext({
  currentTheme: 'light',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  // Since we only support light theme, we create a simplified provider
  const contextValue = {
    currentTheme: 'light',
    toggleTheme: () => console.log('Theme toggle disabled - only light theme is supported')
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
    {children}
  </ThemeContext.Provider>
  );
};

export default ThemeProvider;