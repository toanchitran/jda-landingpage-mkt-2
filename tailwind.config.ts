import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Company Color Palette
        'black': '#000000',
        'deep-purple': '#1f0034',
        'deep-blue': '#03032e',
        'lighter-deep-blue': '#09093e',
        'gold': '#fabf01',
        'copper': '#c0a876',
        'white': '#ffffff',
        
        // Theme Colors
        'primary-bg': '#1f0034',
        'secondary-bg': '#03032e',
        'primary-text': '#ffffff',
        'secondary-text-80': 'rgba(255, 255, 255, 0.8)',
        'secondary-text-60': 'rgba(255, 255, 255, 0.6)',
        'card-elevated': '#09093e66',
        'card-accent-1': '#fabf0133',
        'card-accent-2': '#c0a87640',
        'card-contrast': '#000000',
        'button-primary': '#fabf01',
        'button-secondary': '#c0a876',
        'accent-elements': '#fabf01',
        'dividers-borders': '#c0a87680',
        'hover-states': '#fabf01cc',
        'input-fields': '#09093e4d',
        'success-positive': '#fabf01',
        'links': '#c0a876',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config; 