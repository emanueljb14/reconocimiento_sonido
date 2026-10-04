/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sg: {
          bg: 'var(--sg-bg, #020b1f)',
          panel: 'var(--sg-panel, #071c40)',
          panel2: 'var(--sg-panel2, #08234a)',
          line: 'var(--sg-line, #123b70)',
          blue: '#1264d9',
          cyan: '#00d9ff',
          purple: '#8b5cf6',
          green: '#12d8a0',
          yellow: '#ffc928',
          red: '#ff405c',
          muted: 'var(--sg-muted, #8fa8c7)',
          text: 'var(--sg-text, #ffffff)'
        }
      }
    }
  },
  plugins: []
};