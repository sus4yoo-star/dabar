export type Language = {
  code: string;
  name_native: string;
  name_en: string;
  rtl: boolean;
  enabled: boolean;
  sort: number;
};

export type Tool = {
  id: string;
  slug: string;
  name_ko: string;
  color_key: string;
  sort: number;
  enabled: boolean;
};

export type StepKind = "intro" | "color" | "diagram" | "verse" | "decision";

export type ToolStep = {
  id: string;
  tool_id: string;
  step_order: number;
  kind: StepKind;
  color_key: string | null;
  sketch_key: string | null;
  verse_ref: string | null;
};

export type StepTranslation = {
  step_id: string;
  language_code: string;
  title: string | null;
  body: string | null;
  audio_url: string | null;
  verse_ref: string | null;   // 현지화된 성경 구절 출처 (예: "요한복음 3:16")
  guide: string | null;       // 전도자용 코칭 멘트 ("이렇게 말해보세요…")
};

// 한 단계 + 두 언어(상대/전도자) 콘텐츠를 합친 뷰
export type RenderedStep = ToolStep & {
  seeker: { title: string; body: string; audio_url: string | null; verse_ref: string | null };
  helper: { title: string; body: string; guide: string | null; verse_ref: string | null };
};

export type DecisionContent = {
  language_code: string;
  ask_title: string;
  ask_body: string | null;
  prayer_text: string;
  welcome_title: string;
  welcome_body: string | null;
  audio_url: string | null;
};
