import { supabase } from "@/lib/supabase";

// 성경퀴즈 완주 진도 — 로그인 계정에 문제별 정답/오답 동기화 (기기 간 이어풀기)
export async function fetchQuizProgress(userId: string): Promise<Record<string, "o" | "x">> {
  const out: Record<string, "o" | "x"> = {};
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await supabase
      .from("quiz_progress").select("question_id, correct")
      .eq("user_id", userId).range(from, from + 999);
    if (error || !data?.length) break;
    data.forEach((r: { question_id: string; correct: boolean }) => { out[r.question_id] = r.correct ? "o" : "x"; });
    if (data.length < 1000) break;
  }
  return out;
}

// 특정 문제들의 진도 삭제 (완주 '처음부터' 시 해당 범위 초기화)
export async function clearQuizProgress(userId: string, questionIds: string[]) {
  try {
    for (let i = 0; i < questionIds.length; i += 200) {
      const chunk = questionIds.slice(i, i + 200);
      await supabase.from("quiz_progress").delete().eq("user_id", userId).in("question_id", chunk);
    }
  } catch { /* */ }
}

export async function upsertQuizProgress(userId: string, questionId: string, correct: boolean) {
  try {
    await supabase.from("quiz_progress").upsert(
      { user_id: userId, question_id: questionId, correct, updated_at: new Date().toISOString() },
      { onConflict: "user_id,question_id" }
    );
  } catch { /* 오프라인이어도 로컬 진도는 유지됨 */ }
}
