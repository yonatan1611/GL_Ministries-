import type { Config } from "tailwindcss";

// "Broadcast Ministry" design system for Gospel Light Ministries
// International, modeled on bennyhinn.org's layout and classical serif
// typography but recolored to Gospel Light's own logo palette: deep
// royal navy and vibrant sapphire blue accents (replacing the earlier
// metallic-gold exploration), with crimson/burgundy reserved for the
// highest-conversion CTAs on a rich obsidian-charcoal stage surface.
// The semantic token names (`navy`, `amber`, `slate`, `crimson`) are
// kept stable so every existing component inherits this palette
// automatically — `navy` is the charcoal "stage" scale, `amber` is now
// the brand royal-navy/sapphire-blue accent scale, and `slate.50`/
// `slate.800` are the warm ivory canvas and warm dark-gray body text.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/data/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Charcoal "stage" scale — dark hero/footer/card surfaces and
        // heading text on light sections (navy-900/950 read as near-black
        // charcoal, matching the "Deep Charcoal" heading color).
        navy: {
          50: "#F4EFE6",
          100: "#EADFC8",
          200: "#D9C9A6",
          300: "#C2AC7E",
          400: "#8B7355",
          500: "#5C4A35",
          600: "#3A2E22",
          700: "#242019",
          800: "#1A1D24", // Dark stage surface (page header bands, cards)
          900: "#14161C",
          950: "#111318", // Deepest obsidian charcoal (hero/footer)
        },
        // Gospel Light's original logo accent scale — deep royal navy
        // through vibrant sapphire blue. Used for secondary buttons,
        // dividers, crest borders, and highlights (replaces the earlier
        // metallic-gold exploration).
        amber: {
          50: "#EFF6FF", // Brand blue — soft tint
          100: "#DBEAFE", // Brand blue — softer tint
          200: "#BFDBFE",
          300: "#60A5FA", // Brand blue — light highlight
          400: "#3B82F6",
          500: "#2563EB", // Brand sapphire blue — primary
          600: "#2563EB", // Brand sapphire blue (default button slot)
          700: "#1E40AF", // Brand blue — deep (hover/pressed)
          800: "#1B365D", // Brand deep royal navy
          900: "#0F2342", // Brand navy — darker
        },
        // Gospel Light's original logo colors, also exposed directly.
        "brand-navy": {
          DEFAULT: "#1B365D",
          dark: "#0F2342",
          darker: "#091528",
        },
        "brand-blue": {
          DEFAULT: "#2563EB",
          deep: "#1E40AF",
          light: "#3B82F6",
          lighter: "#60A5FA",
          soft: "#EFF6FF",
          softer: "#DBEAFE",
        },
        slate: {
          50: "#FAF7F2", // Warm ivory page canvas
          800: "#3A3A3A", // Warm dark-gray body text
        },
        // Ministry crimson/burgundy — reserved for the highest-conversion
        // CTAs: Donate Now, Accept Jesus Today!, Get the Offer, Sign Me Up.
        crimson: {
          50: "#FDF2F2",
          100: "#FBE4E4",
          200: "#F3C6C6",
          300: "#E49595",
          400: "#CB4A4A",
          500: "#B91C1C",
          600: "#B91C1C", // Primary crimson CTA
          700: "#7F1D1D", // Hover / pressed — deep burgundy
          800: "#5C1414",
        },
      },
      backgroundImage: {
        "brand-logo-gradient": "linear-gradient(135deg, #1B365D 0%, #1E40AF 50%, #2563EB 100%)",
        "bh-crimson-gradient": "linear-gradient(180deg, #C82323 0%, #8E1515 100%)",
        "bh-stage-radial": "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.18), rgba(15, 23, 42, 0.96))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-ethiopic)", "sans-serif"],
        // Classical editorial display serif (Playfair Display) for
        // section headlines and hero copy — falls back through Noto
        // Serif, then Noto Sans Ethiopic for Amharic glyphs.
        display: [
          "var(--font-playfair)",
          "var(--font-serif)",
          "var(--font-ethiopic)",
          "Georgia",
          "serif",
        ],
        // Small uppercase crest/wordmark lettering (the "GOSPEL LIGHT"
        // logo lockup).
        crest: ["var(--font-cinzel)", "var(--font-ethiopic)", "serif"],
        // Uppercase, wide-tracking nav links and buttons.
        nav: [
          "var(--font-montserrat)",
          "var(--font-sans)",
          "var(--font-ethiopic)",
          "sans-serif",
        ],
        ethiopic: ["var(--font-ethiopic)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
