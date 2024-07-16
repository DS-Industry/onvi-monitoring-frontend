/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary01: "#BFFA00",
        primary02: "#0B68E1",
        primary02_Hover: "#094DA7",
        text02: "#747677",
        text01: "#000000",
        text03: "#D8D9DD",
        text04: "#FFFFFF",
        textError: "#FF3B30",
        successFill: "#00A355",
        errorFill:"#EB5757",
        background01: "#1F1F1F",
        background02: "#FFFFFF",
        background05: "#F8F8FA",
        background06: "#E4F0FF",
        opacity01: "#D8D9DD",
      },
      boxShadow: {
        card: "0 2px 13px -2px rgba(27, 33, 44, 0.12)",
      },
      backgroundImage: {
        'Factory-Letter-S': "url('./src/assets/Factory Letter S.svg')",

      }
    },
  },
  plugins: [],
};
