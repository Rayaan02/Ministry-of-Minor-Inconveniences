/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky: '#75C9E8',
        cream: '#FFF0C9',
        grass: '#79B86A',
        forest: '#356B53',
        coral: '#E97862',
        gold: '#F5C86A',
        lavender: '#A994D4',
        navy: '#29364F',
        wood: '#956746',
        paper: '#FFF8E6'
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"Pixelify Sans"', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
