/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--bg-cream)",
        ink: "var(--ink)",
        field: "var(--field)",
        bone: "var(--bone)",
        sand: "var(--sand)",
        peach: "var(--peach)",
        "ark-gold": "var(--ark-gold)",
        grace: "var(--grace)",
        word: "var(--word)",
        "word-edge": "var(--word-edge)",
        share: "var(--share)",
        "share-edge": "var(--share-edge)",
        mission: "var(--mission)",
        "mission-edge": "var(--mission-edge)",
        event: "var(--event)",
        "event-edge": "var(--event-edge)",
        rain: "var(--rain)",
      },
      fontFamily: {
        display: ["Jua", "system-ui", "sans-serif"],
        body: ["Pretendard", "Apple SD Gothic Neo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
