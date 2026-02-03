/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#4f46e5', // indigo-600
                    DEFAULT: '#4338ca', // indigo-700
                    dark: '#3730a3', // indigo-800
                }
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
