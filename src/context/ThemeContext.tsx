import React, { createContext, useContext, useState } from 'react';
import { Themes, ThemeType } from '@/constants/theme';

interface ThemeContextData {
  theme: typeof Themes.primary;
  currentTheme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('primary');

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'primary' ? 'secondary' : 'primary'));
  };

  return (
    <ThemeContext.Provider value={{ theme: Themes[currentTheme], currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);