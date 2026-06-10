import PresentClient from "./PresentClient";

// 5개 도구 페이지를 빌드 시 정적으로 미리 생성한다.
// → 서버리스 렌더링에 의존하지 않아 어디서든(오프라인 PWA 포함) 항상 열린다.
export function generateStaticParams() {
  return [
    { tool: "wordless" },
    { tool: "four-laws" },
    { tool: "bridge" },
    { tool: "three-circles" },
    { tool: "romans" },
  ];
}

// 목록 밖의 slug 도 클라이언트에서 처리(콘텐츠 없으면 안내) 하도록 허용
export const dynamicParams = true;

export default function Page() {
  return <PresentClient />;
}
