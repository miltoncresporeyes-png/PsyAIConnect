import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors - Institutional, serious, trustworthy
                primary: {
                    50: '#f0f7f4',
                    100: '#dceee6',
                    200: '#bcddd0',
                    300: '#8fc5b3',
                    400: '#5fa692',
                    500: '#3f8a76',
                    600: '#2d6f5e',
                    700: '#265a4d',
                    800: '#214940',
                    900: '#1B4D3E', // Main institutional green
                    950: '#0f2a22',
                },
                secondary: {
                    50: '#FDFBF7',  // Cream background
                    100: '#F5F1EB', // Beige warm
                    200: '#E8E2D9',
                    300: '#D4CBC0',
                    400: '#B8AA9A',
                    500: '#9C8B79',
                    600: '#857261',
                    700: '#6E5D50',
                    800: '#5C4E44',
                    900: '#4D423A',
                    950: '#2D251F',
                },
                accent: {
                    50: '#f4f6f8',
                    100: '#e3e8ed',
                    200: '#cad4de',
                    300: '#a5b5c6',
                    400: '#7991a9',
                    500: '#5a758f',
                    600: '#475e77',
                    700: '#3d4f62',
                    800: '#364453',
                    900: '#2D3E50', // Night blue accent
                    950: '#1d2833',
                },
                // Semantic colors
                crisis: {
                    light: '#fef2f2',
                    DEFAULT: '#dc2626',
                    dark: '#991b1b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            backgroundImage: {
                'gradient-hero': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
                'gradient-emerald': 'linear-gradient(to bottom right, rgb(236, 253, 245), rgb(204, 251, 241))',
                'gradient-teal': 'linear-gradient(to bottom right, rgb(240, 253, 250), rgb(204, 251, 241))',
                'gradient-indigo': 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 231, 255))',
                'gradient-blue': 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 231, 255))',
                'gradient-purple': 'linear-gradient(to bottom right, rgb(250, 245, 255), rgb(237, 233, 254))',
                'radial-subtle': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}

export default config
