import { Theme } from '../types/theme';

export const defaultTheme: Theme = {
  colors: {
    primary: '#4F46E5',
    secondary: '#10B981',
    background: '#F3F4F6',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    text: '#1F2937',
    buttonPrimary: '#4F46E5',
    buttonSecondary: '#9CA3AF'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      base: '1rem',
      heading: '1.5rem',
      subheading: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  spacing: {
    base: '1rem',
    small: '0.5rem',
    medium: '1.5rem',
    large: '2rem'
  }
};