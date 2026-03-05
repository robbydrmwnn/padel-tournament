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
                sans: ['FFDin', ...defaultTheme.fontFamily.sans],
                ffdin: ['FFDin', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
                raverist: ['FFDin', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
                gotham: ['FFDin', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#111111',
                    50: '#F5F5F5',
                    100: '#E0E0E0',
                    200: '#BDBDBD',
                    300: '#9E9E9E',
                    400: '#757575',
                    500: '#111111',
                    600: '#0D0D0D',
                    700: '#0A0A0A',
                    800: '#080808',
                    900: '#050505',
                },
                success: {
                    DEFAULT: '#444444',
                    50: '#F8F8F8',
                    100: '#EBEBEB',
                    200: '#D6D6D6',
                    300: '#ADADAD',
                    400: '#717171',
                    500: '#444444',
                    600: '#363636',
                    700: '#282828',
                    800: '#1A1A1A',
                    900: '#0D0D0D',
                },
                neutral: {
                    DEFAULT: '#F5F5F5',
                    50: '#FFFFFF',
                    100: '#F5F5F5',
                    200: '#EEEEEE',
                    300: '#E0E0E0',
                    400: '#BDBDBD',
                    500: '#9E9E9E',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                },
                accent: {
                    DEFAULT: '#D4AF37',
                    50: '#FBF7E8',
                    100: '#F5ECC8',
                    200: '#ECD991',
                    300: '#E3C65A',
                    400: '#D9B635',
                    500: '#D4AF37',
                    600: '#B8962A',
                    700: '#8C7220',
                    800: '#5F4E15',
                    900: '#332A0B',
                },
                dark: '#0a0a0a',
            },
        },
    },

    plugins: [forms],
};
