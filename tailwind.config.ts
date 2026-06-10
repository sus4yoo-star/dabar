import type { Config } from "tailwindcss";

// 다바르는 인라인스타일+테마, 베소라(/share)는 Tailwind 유틸리티를 사용한다.
// preflight(전역 reset)를 꺼서 다바르 기존 인라인 스타일이 절대 바뀌지 않게 한다.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  corePlugins: { preflight: false }, // ★ 전역 reset 끔 → 다바르 기존 스타일 보존
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#15121E", 2: "#1F1A2C", 3: "#2A2440" },
        gospel: { gold: "#E3B23C", ink: "#2A2440", crimson: "#C9402F", parch: "#F5F1E8", green: "#5AA476", violet: "#9B8CC4" },
        muted: "#938CA8",
      },
      fontFamily: { serif: ["Noto Serif KR", "serif"] },
    },
  },
  plugins: [],
};
export default config;
