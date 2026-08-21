/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080B10',
          900: '#0C1117',
          850: '#10161D',
          800: '#141B24',
          700: '#1B242F',
          600: '#232F3D',
          500: '#2E3C4D',
        },
        line: '#1E2733',
        paper: '#E9EDF3',
        muted: '#8B96A5',
        faint: '#59636F',
        amber: {
          400: '#F0A93B',
          500: '#E8952A',
          600: '#C97D1E',
        },
        gain: '#31C48D',
        loss: '#E5546B',
        signal: '#4C8BF5',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
}
