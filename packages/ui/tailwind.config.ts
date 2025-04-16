import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        cocogoose: ['Cocogoose', 'sans-serif'],
      },
      colors: {
        gradientStart: "hsl(48, 100%, 85%)",
        gradientMiddle: "hsl(42, 100%, 70%)",
        gradientEnd: "hsl(54, 100%, 60%)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        blue: {
          100: '#EFF6FC',
          600: '#2E86DE',
        },
        green: {
          100: '#EFF7F2',
          600: '#329F5D',
        },
        red: {
          100: '#FAEDEC',
          600: '#C2160A',
        },
        orange: {
          100: '#FFF5EB',
          600: '#FA7F05',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "scrollLeft": {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        "scrollRight": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        "gradientMove": {
          '0%': { transform: 'rotate(0deg) translate(0, 0)' },
          '50%': { transform: 'rotate(180deg) translate(50px, 50px)' },
          '100%': { transform: 'rotate(360deg) translate(0, 0)' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'message-appear': {
          '0%': {
            opacity: '0',
            transform: 'translateY(8px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'message-appear': 'message-appear 0.3s ease-out forwards',
        'gradient-move': 'gradientMove 8s infinite alternate',
        "background-size": "200% 200%",
        "animation": "gradient-x 15s ease infinite",
        'scroll-left': 'scrollLeft 10s linear infinite',
        'scroll-right': 'scrollRight 10s linear infinite',
        'shimmer': 'shimmer 2s infinite'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
