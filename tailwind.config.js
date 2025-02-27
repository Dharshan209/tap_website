/** @type {import('tailwindcss').Config} */
module.exports = {
    plugins: [require("tailwindcss-animate"), require('@tailwindcss/forms')],
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
      './src/**/*.{js,jsx}',
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "sm": "640px",
          "md": "768px",
          "lg": "1024px",
          "xl": "1280px",
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
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
          success: {
            DEFAULT: "hsl(var(--success))",
            foreground: "hsl(var(--success-foreground))",
          },
          warning: {
            DEFAULT: "hsl(var(--warning))",
            foreground: "hsl(var(--warning-foreground))",
          },
          danger: {
            DEFAULT: "hsl(var(--danger))",
            foreground: "hsl(var(--danger-foreground))",
          },
          info: {
            DEFAULT: "hsl(var(--info))",
            foreground: "hsl(var(--info-foreground))",
          },
          // Brand colors for TAP - now using HSL variables instead of hex
          tap: {
            primary: "hsl(var(--primary))",
            secondary: "hsl(var(--secondary))",
            accent: "hsl(var(--accent))",
            light: "hsl(var(--muted))",
            dark: "hsl(var(--card))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
          xl: "calc(var(--radius) + 4px)",
          "2xl": "calc(var(--radius) + 8px)",
        },
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          heading: ["Lexend", "Inter", "system-ui", "sans-serif"],
          mono: ["Fira Code", "monospace"],
        },
        fontSize: {
          xs: ["0.75rem", { lineHeight: "1rem" }],
          sm: ["0.875rem", { lineHeight: "1.25rem" }],
          base: ["1rem", { lineHeight: "1.5rem" }],
          lg: ["1.125rem", { lineHeight: "1.75rem" }],
          xl: ["1.25rem", { lineHeight: "1.75rem" }],
          "2xl": ["1.5rem", { lineHeight: "2rem" }],
          "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
          "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
          "5xl": ["3rem", { lineHeight: "1" }],
          "6xl": ["3.75rem", { lineHeight: "1" }],
          "7xl": ["4.5rem", { lineHeight: "1" }],
          "8xl": ["6rem", { lineHeight: "1" }],
          "9xl": ["8rem", { lineHeight: "1" }],
        },
        boxShadow: {
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          "glow": "0 0 15px 0 hsl(var(--primary) / 0.5)",
          "glow-accent": "0 0 15px 0 hsl(var(--accent) / 0.5)",
          inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
          none: "none",
        },
        keyframes: {
          "accordion-down": {
            from: { height: 0 },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: 0 },
          },
          "float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-10px)" },
          },
          "pulse-slow": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.5 },
          },
          "background-shine": {
            "from": { backgroundPosition: "0 0" },
            "to": { backgroundPosition: "-200% 0" }
          },
          "shimmer": {
            "100%": { transform: "translateX(100%)" }
          },
          "rotate-slow": {
            "from": { transform: "rotate(0deg)" },
            "to": { transform: "rotate(360deg)" }
          },
          "blob": {
            "0%": { transform: "translate(0px, 0px) scale(1)" },
            "33%": { transform: "translate(30px, -50px) scale(1.1)" },
            "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
            "100%": { transform: "translate(0px, 0px) scale(1)" }
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "float": "float 6s ease-in-out infinite",
          "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "background-shine": "background-shine 2s linear infinite",
          "shimmer": "shimmer 1.5s infinite",
          "rotate-slow": "rotate-slow 15s linear infinite",
          "blob": "blob 7s infinite"
        },
        backgroundImage: {
          "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
          "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
          "gradient-subtle": "linear-gradient(to right bottom, hsl(var(--muted)), hsl(var(--background)))",
          "gradient-highlight": "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))",
          "shine": "linear-gradient(45deg, transparent 25%, hsl(var(--primary) / 0.3) 25%, hsl(var(--accent) / 0.3) 50%, transparent 50%)",
        },
      },
    },
  }