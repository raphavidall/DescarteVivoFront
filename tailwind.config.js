/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B2336',    // Azul escuro do fundo (aproximado do print)
          brown: '#8B4513',   // Marrom da mochila
          orange: '#FF8C00',  // Laranja detalhes
          green: '#4CAF50',   // Verde do cubo
          gray: '#F5F5F5',    // Fundo dos inputs
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Vamos garantir essa fonte depois
      },
      keyframes: {
        pulsar: {
          '0%, 100%': { transform: 'scale(1)' }, // Começa e termina no tamanho normal
          '50%': { transform: 'scale(1.03)' },   // No meio, cresce 3% (bem sutil)
        }
      },
      animation: {
        // Nome da classe: 'pulsar' | duração: 2s | tipo: suave | repetição: infinita
        'pulsar': 'pulsar 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}