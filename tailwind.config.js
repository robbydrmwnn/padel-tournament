import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Gotham', 'Figtree', ...defaultTheme.fontFamily.sans],
                raverist: ['Raverist', 'sans-serif'],
                gotham: ['Gotham', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#3E4290',
                    50: '#F0F1F9',
                    100: '#D9DBEE',
                    200: '#B3B7DD',
                    300: '#8D93CC',
                    400: '#656FBB',
                    500: '#3E4290',
                    600: '#323574',
                    700: '#252856',
                    800: '#191B3A',
                    900: '#0C0E1D',
                },
                success: {
                    DEFAULT: '#4BA661',
                    50: '#F1F8F3',
                    100: '#DCEEE1',
                    200: '#B9DDC3',
                    300: '#96CCA5',
                    400: '#73BB87',
                    500: '#4BA661',
                    600: '#3C854E',
                    700: '#2D643B',
                    800: '#1E4327',
                    900: '#0F2114',
                },
                neutral: {
                    DEFAULT: '#F7F7F7',
                    50: '#FFFFFF',
                    100: '#F7F7F7',
                    200: '#E9E9E9',
                    300: '#DBDBDB',
                    400: '#CDCDCD',
                    500: '#BFBFBF',
                    600: '#999999',
                    700: '#737373',
                    800: '#4D4D4D',
                    900: '#222222',
                },
                accent: {
                    DEFAULT: '#D8E802',
                    50: '#FCFEE6',
                    100: '#F9FDC9',
                    200: '#F3FB93',
                    300: '#EDF95D',
                    400: '#E7F727',
                    500: '#D8E802',
                    600: '#ADB902',
                    700: '#818B01',
                    800: '#555C01',
                    900: '#2A2E00',
                },
                dark: '#222222',
            },
        },
    },

    plugins: [forms],
};
