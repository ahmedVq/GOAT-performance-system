/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coal: '#050505',
        'blood-red': '#E11919',
        'blood-dark': '#B90F16',
        'blood-deep': '#7C0D12',
        'off-white': '#F5F5F5',
        'steel-gray': '#9BA3A7',
      },
      fontFamily: {
        display: ['Impact', 'Haettenschweiler', 'Arial Narrow', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'combat-grid': `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'combat-grid': '40px 40px',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(225, 25, 25, 0.15)',
        'red-glow-lg': '0 0 40px rgba(225, 25, 25, 0.2)',
      },
    },
  },
  plugins: [],
}
