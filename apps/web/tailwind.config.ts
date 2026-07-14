import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:      '#070707',
        surface: '#0d0d0d',
        'surface-hover': '#111111',
        border:  '#181818',
        'border-subtle': '#111111',
        primary:   '#e8e8e8',
        secondary: '#888888',
        muted:     '#7a7a7a',
        disabled:  '#3a3a3a',
        accent: {
          DEFAULT: '#10b981',
          hover:   '#0ea472',
        },
        danger:  '#f87171',
        warning: '#f59e0b',
      },
      letterSpacing: {
        tighter2: '-0.04em',
        tighter3: '-0.05em',
        tighter4: '-0.055em',
        wider2: '0.08em',
        wider3: '0.1em',
        wider4: '0.12em',
      },
    },
  },
  plugins: [],
}

export default config
