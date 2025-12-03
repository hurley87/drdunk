import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brutal: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brutalist palette - Black, White, Red
        brutal: {
          black: '#000000',
          white: '#ffffff',
          red: '#ff0000',
          'red-dark': '#cc0000',
          gray: '#1a1a1a',
          'gray-light': '#f2f2f2',
        },
        // Primary red accent
        primary: {
          50: "#fff5f5",
          100: "#ffe3e3",
          200: "#ffc9c9",
          300: "#ffa3a3",
          400: "#ff6b6b",
          500: "#ff0000",
          600: "#e60000",
          700: "#cc0000",
          800: "#990000",
          900: "#660000",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Shadcn required colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
        none: "0",
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px black',
        'brutal-sm': '2px 2px 0px 0px black',
        'brutal-lg': '6px 6px 0px 0px black',
        'brutal-xl': '8px 8px 0px 0px black',
        'brutal-red': '4px 4px 0px 0px #ff0000',
        'brutal-red-lg': '6px 6px 0px 0px #ff0000',
        'brutal-white': '4px 4px 0px 0px white',
        'none': 'none',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "brutal-shake": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "10%": { transform: "translateX(-2px) rotate(-1deg)" },
          "20%": { transform: "translateX(2px) rotate(1deg)" },
          "30%": { transform: "translateX(-2px) rotate(0deg)" },
          "40%": { transform: "translateX(2px) rotate(1deg)" },
          "50%": { transform: "translateX(-2px) rotate(-1deg)" },
          "60%": { transform: "translateX(2px) rotate(0deg)" },
          "70%": { transform: "translateX(-2px) rotate(-1deg)" },
          "80%": { transform: "translateX(2px) rotate(1deg)" },
          "90%": { transform: "translateX(-2px) rotate(0deg)" },
        },
        "brutal-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "number-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        "entry-appear": {
          "0%": { 
            opacity: "0",
            transform: "translateX(-20px) rotate(-2deg)",
          },
          "100%": { 
            opacity: "1",
            transform: "translateX(0) rotate(0deg)",
          },
        },
        "rank-change": {
          "0%": { 
            transform: "scale(1.2)",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
          },
          "100%": { 
            transform: "scale(1)",
            backgroundColor: "transparent",
          },
        },
        "countdown-tick": {
          "0%": { transform: "scale(1)" },
          "10%": { transform: "scale(1.2)" },
          "20%": { transform: "scale(1)" },
        },
        "chaos-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "33%": { transform: "translateY(-4px) rotate(1deg)" },
          "66%": { transform: "translateY(2px) rotate(-0.5deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        "scale-out": "scale-out 0.15s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.2s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.2s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.2s ease-out",
        "glitch": "glitch 0.3s ease-in-out",
        "brutal-shake": "brutal-shake 0.5s ease-in-out",
        "brutal-bounce": "brutal-bounce 0.6s ease-in-out infinite",
        "number-pop": "number-pop 0.3s ease-out",
        "entry-appear": "entry-appear 0.3s ease-out",
        "rank-change": "rank-change 0.4s ease-out",
        "countdown-tick": "countdown-tick 1s ease-out",
        "chaos-float": "chaos-float 4s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "brutal": "cubic-bezier(0.2, 0, 0, 1)",
      },
      rotate: {
        '1': '1deg',
        '2': '2deg',
        '3': '3deg',
        '5': '5deg',
        '-1': '-1deg',
        '-2': '-2deg',
        '-3': '-3deg',
        '-5': '-5deg',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
