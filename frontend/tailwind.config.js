/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FFF4F0',
                    100: '#FFE8DE',
                    200: '#FFD0BC',
                    300: '#FFB08A',
                    400: '#FF8A4C',
                    500: '#FF5C01',
                    600: '#E64D00',
                    700: '#BF3D00',
                    800: '#993100',
                    900: '#732600',
                    950: '#4D1900',
                },
                brand: {
                    orange: '#FF5C01',
                    dark: '#020306',
                    gray: '#B9B9B9',
                    light: '#F4F4F6',
                },
            },
            fontFamily: {
                sans: ['Lufga', 'system-ui', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
