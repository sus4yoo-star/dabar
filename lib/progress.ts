// 양육 과정 진도(수료) — 기기에 저장(v1). 추후 로그인 계정 연동 가능.
const KEY = "dabar_course_progress";

export function getCompleted(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function isDone(slug: string, lessonId: string): boolean {
  return !!getCompleted()[`${slug}/${lessonId}`];
}
export function markDone(slug: string, lessonId: string): void {
  const c = getCompleted();
  c[`${slug}/${lessonId}`] = true;
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
}
export function doneCount(slug: string, lessonIds: string[]): number {
  const c = getCompleted();
  return lessonIds.filter(id => c[`${slug}/${id}`]).length;
}
