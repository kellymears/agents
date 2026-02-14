/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './mdx-components.tsx',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        foreground: '#ededed',
        'muted-foreground': '#888888',
        muted: '#1a1a1c',
        border: '#262626',
        primary: '#ededed',
        'primary-foreground': '#0a0a0b',
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Mono"', '"Geist Mono"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
          },
        },
      },
    },
  },
  plugins: [],
}
