/**
 * 점수 기록 (로그인 없이 기기 내 localStorage 저장)
 */
export interface HistoryEntry {
  date: string;   // ISO 문자열
  score: number;
  total: number;
  pct: number;
}

const KEY = "dabar_history";
const MAX = 50; // 최근 50회만 보관

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addHistory(score: number, total: number): void {
  if (typeof window === "undefined" || total <= 0) return;
  const entry: HistoryEntry = {
    date: new Date().toISOString(),
    score,
    total,
    pct: Math.round((score / total) * 100),
  };
  const next = [entry, ...loadHistory()].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* 용량 초과 무시 */ }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch { /* 무시 */ }
}

export interface HistoryStats {
  plays: number;
  avgPct: number;
  bestPct: number;
  totalCorrect: number;
  totalQuestions: number;
}

export function getStats(history: HistoryEntry[]): HistoryStats {
  if (!history.length) {
    return { plays: 0, avgPct: 0, bestPct: 0, totalCorrect: 0, totalQuestions: 0 };
  }
  const totalCorrect = history.reduce((s, h) => s + h.score, 0);
  const totalQuestions = history.reduce((s, h) => s + h.total, 0);
  return {
    plays: history.length,
    avgPct: Math.round(history.reduce((s, h) => s + h.pct, 0) / history.length),
    bestPct: Math.max(...history.map(h => h.pct)),
    totalCorrect,
    totalQuestions,
  };
}
