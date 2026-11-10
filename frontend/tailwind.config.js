/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bloom: {
          primary: '#D96C91',       // Dusty Rose
          secondary: '#F4B8CC',     // Soft Pink
          bg: '#FFF7FA',            // Blush White
          light: '#FCE4EC',         // Light Pink
          deep: '#B94D75',          // Deep Pink
          accent: '#A66C83',        // Mauve
          dark: '#392936',          // Dark Plum
          card: '#FFFFFF',
          border: '#F9D8E4',
          subtle: '#8C7282',
          surface: '#FFF0F5',
          // Dark mode complements
          darkbg: '#1A1217',
          darkcard: '#281E25',
          darkborder: '#45333F',
          darktext: '#FDEFF4',
          darkmuted: '#B89DAE'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        'bloom': '0 8px 30px rgba(217, 108, 145, 0.08)',
        'bloom-lg': '0 14px 40px rgba(217, 108, 145, 0.14)',
        'bloom-inner': 'inset 0 2px 6px rgba(217, 108, 145, 0.05)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}

