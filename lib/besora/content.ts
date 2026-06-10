import { getSupabase } from "@/lib/besora/supabase";
import type {
  Language,
  Tool,
  ToolStep,
  StepTranslation,
  RenderedStep,
  DecisionContent,
} from "@/lib/besora/types";

export async function fetchLanguages(): Promise<Language[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("languages")
    .select("*")
    .eq("enabled", true)
    .order("sort");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTools(): Promise<Tool[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("tools")
    .select("*")
    .eq("enabled", true)
    .order("sort");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTool(slug: string): Promise<Tool | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * 한 도구의 모든 단계를, 상대 언어(seeker)와 전도자 따라읽기 언어(helper)
 * 두 가지로 합쳐서 반환. 상대 언어 콘텐츠가 비어 있으면 한국어로 폴백.
 */
export async function fetchRenderedSteps(
  toolId: string,
  seekerLang: string,
  helperLang: string
): Promise<RenderedStep[]> {
  const sb = getSupabase();

  const { data: steps, error: e1 } = await sb
    .from("tool_steps")
    .select("*")
    .eq("tool_id", toolId)
    .order("step_order");
  if (e1) throw e1;
  const stepRows = (steps ?? []) as ToolStep[];
  if (stepRows.length === 0) return [];

  const ids = stepRows.map((s) => s.id);
  const langs = Array.from(new Set([seekerLang, helperLang, "ko"]));
  const { data: trs, error: e2 } = await sb
    .from("tool_step_translations")
    .select("*")
    .in("step_id", ids)
    .in("language_code", langs);
  if (e2) throw e2;
  const trRows = (trs ?? []) as StepTranslation[];

  const pick = (stepId: string, lang: string) =>
    trRows.find((t) => t.step_id === stepId && t.language_code === lang);

  return stepRows.map((s) => {
    const seeker = pick(s.id, seekerLang) ?? pick(s.id, "ko");
    const helper = pick(s.id, helperLang) ?? pick(s.id, "ko");
    return {
      ...s,
      seeker: {
        title: seeker?.title ?? "",
        body: seeker?.body ?? "",
        audio_url: seeker?.audio_url ?? null,
      },
      helper: {
        title: helper?.title ?? "",
        body: helper?.body ?? "",
      },
    };
  });
}

export async function fetchDecision(
  lang: string
): Promise<DecisionContent | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("decision_translations")
    .select("*")
    .in("language_code", [lang, "ko"]);
  if (error) throw error;
  const rows = (data ?? []) as DecisionContent[];
  return rows.find((r) => r.language_code === lang) ?? rows[0] ?? null;
}

export async function logSession(params: {
  toolSlug: string;
  seekerLanguage: string;
  decided: boolean;
}): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  await sb.from("sessions").insert({
    evangelist_id: auth.user?.id ?? null,
    tool_slug: params.toolSlug,
    seeker_language: params.seekerLanguage,
    decided: params.decided,
  });
}
