import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          primary: "hsl(var(--brand-primary))",
          dark: "hsl(var(--brand-dark))",
        },
        btn: {
          seen: "hsl(var(--btn-seen))",
          "preparing": "hsl(var(--btn-preparing))",
          done: "hsl(var(--btn-done))",
        },
        order: {
          "dine-in": "hsl(var(--order-dine-in))",
          "take-out": "hsl(var(--order-take-out))",
          delivery: "hsl(var(--order-delivery))",
          banquet: "hsl(var(--order-banquet))",
        },
        status: {
          new: "hsl(var(--status-new))",
          "preparing": "hsl(var(--status-preparing))",
          seen: "hsl(var(--status-seen))",
          served: "hsl(var(--status-served))",
          overtime: "hsl(var(--status-overtime))",
        },
        allergen: "hsl(var(--allergen-alert))",
        modifier: {
          extra: "hsl(var(--modifier-extra))",
          remove: "hsl(var(--modifier-remove))",
          neutral: "hsl(var(--modifier-neutral))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        "surface-card": "hsl(var(--surface-card))",
        "surface-bg": "hsl(var(--surface-bg))",
        "tickets-bg": "hsl(var(--tickets-bg))",
        "sidebar-bg": "hsl(var(--sidebar-bg))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "order-num": ["4.5em", { lineHeight: "1", fontWeight: "900" }],
        "badge-type": ["0.9375em", { lineHeight: "1", fontWeight: "700", letterSpacing: "0.05em" }],
        "section-label": ["0.6875em", { lineHeight: "1", fontWeight: "700", letterSpacing: "0.08em" }],
        "item-name": ["0.9375em", { lineHeight: "1.3", fontWeight: "600" }],
        "modifier": ["0.8125em", { lineHeight: "1.3", fontWeight: "600" }],
        "timer": ["0.8125em", { lineHeight: "1", fontWeight: "600" }],
        "cta": ["0.875em", { lineHeight: "1", fontWeight: "700", letterSpacing: "0.03em" }],
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
        "ticket-blink": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(var(--ticket-blink-rgb, 226 75 74) / 0)" },
          "50%": { boxShadow: "0 0 18px 4px rgb(var(--ticket-blink-rgb, 226 75 74) / 0.7)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ticket-blink": "ticket-blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/container-queries")],
} satisfies Config;
