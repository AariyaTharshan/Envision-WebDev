module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
      },
    },
  },
  plugins: [],
}

