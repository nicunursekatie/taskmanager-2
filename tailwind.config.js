/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4361ee',
          light: '#4895ef',
          dark: '#3a0ca3',
        },
        accent: '#f72585',
        success: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
        priority: {
          'must-do': '#e74c3c',
          'want-to-do': '#f39c12',
          'when-i-can': '#3498db',
        },
        text: {
          DEFAULT: '#222222',
          light: '#444444',
        },
        background: {
          DEFAULT: '#f4f7fa',
          card: '#ffffff',
          section: '#f8f9fa',
          button: '#f1f3f5',
        },
        border: '#d8e0e9',
      },
      spacing: {
        xs: '0.375rem',  /* 6px */
        sm: '0.625rem',  /* 10px */
        md: '1.25rem',   /* 20px */
        lg: '1.875rem',  /* 30px */
        xl: '2.5rem',    /* 40px */
      },
      fontSize: {
        xs: '0.875rem',  /* 14px */
        sm: '1rem',     /* 16px */
        md: '1.125rem', /* 18px */
        lg: '1.25rem',  /* 20px */
        xl: '1.5rem',   /* 24px */
        '2xl': '1.75rem', /* 28px */
        '3xl': '2rem',    /* 32px */
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
        md: '0 6px 15px rgba(0, 0, 0, 0.07), 0 3px 5px rgba(0, 0, 0, 0.03)',
        lg: '0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        DEFAULT: '0.2s',
      },
      lineHeight: {
        DEFAULT: '1.6',
      },
    },
  },
  plugins: [],
}

