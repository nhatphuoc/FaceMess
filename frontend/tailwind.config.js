/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Bao gồm các file trong thư mục app
    './pages/**/*.{js,ts,jsx,tsx}', // Bao gồm các file trong thư mục pages (nếu dùng)
    './components/**/*.{js,ts,jsx,tsx}', // Bao gồm các file trong thư mục components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}