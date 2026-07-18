/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Registramos la fuente con soporte de caída a sans-serif
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
}