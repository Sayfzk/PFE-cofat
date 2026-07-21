import { useState, useEffect } from 'react';

/**
 * Custom hook for managing application theme (light/dark mode)
 * Persists theme preference in localStorage
 */
export const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);

        // Reset to light theme when leaving a module (component unmount)
        return () => {
            document.documentElement.setAttribute('data-theme', 'light');
        };
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark'
    };
};

export default useTheme;
