import PresentClient from "./PresentClient";

// 5개 도구 페이지를 빌드 시 정적으로 미리 생성한다.
export function generateStaticParams() {
  return [
    { tool: "wordless" },
    { tool: "four-laws" },
    { tool: "bridge" },
    { tool: "three-circles" },
    { tool: "romans" },
  ];
}

export const dynamicParams = true;

export default function Page() {
  return <PresentClient />;
}
