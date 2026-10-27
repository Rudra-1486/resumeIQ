import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Read saved theme preference ('light' | 'dark' | 'system'), default to 'dark'
  const [theme, setThemeState] = useState(() => {
    try {
      const raw = localStorage.getItem('resumeiq_ui_preferences_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (['light', 'dark', 'system'].includes(parsed.theme)) return parsed.theme;
      }
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
    }
    return 'dark';
  });

  const [autoSaveReports, setAutoSaveReportsState] = useState(() => {
    try {
      const raw = localStorage.getItem('resumeiq_ui_preferences_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.auto_save_reports === 'boolean') return parsed.auto_save_reports;
      }
    } catch (e) {}
    return true;
  });

  // Calculate actual active theme ('dark' or 'light')
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [resolvedTheme, setResolvedTheme] = useState(() =>
    theme === 'system' ? getSystemTheme() : theme
  );

  // Apply .dark or .light class to <html> element
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const active = getSystemTheme();
      setResolvedTheme(active);
      root.classList.remove('light', 'dark');
      root.classList.add(active);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      setResolvedTheme(theme);
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  // Set theme and persist
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      const raw = localStorage.getItem('resumeiq_ui_preferences_v1');
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'resumeiq_ui_preferences_v1',
        JSON.stringify({
          schema_version: 1,
          theme: newTheme,
          auto_save_reports: existing.auto_save_reports ?? true,
          updated_at: new Date().toISOString()
        })
      );
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  };

  const setAutoSaveReports = (val) => {
    setAutoSaveReportsState(val);
    try {
      const raw = localStorage.getItem('resumeiq_ui_preferences_v1');
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'resumeiq_ui_preferences_v1',
        JSON.stringify({
          schema_version: 1,
          theme: existing.theme || 'dark',
          auto_save_reports: val,
          updated_at: new Date().toISOString()
        })
      );
    } catch (e) {
      console.error('Error saving preferences to localStorage:', e);
    }
  };

  const resetPreferences = () => {
    try {
      localStorage.removeItem('resumeiq_ui_preferences_v1');
    } catch (e) {}
    setThemeState('dark');
    setAutoSaveReportsState(true);
  };

  // Toggle function: flips between dark and light
  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        toggleTheme,
        autoSaveReports,
        setAutoSaveReports,
        resetPreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
