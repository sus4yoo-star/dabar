export type Testament = "old" | "new";
export type Level = "easy" | "medium" | "hard";
export type Category = "인물" | "사건" | "말씀" | "지명";

export interface Question {
  id: string;
  book: string;
  testament: Testament;
  category: Category;
  level: Level;
  question: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
  lang?: string;
  created_at: string;
}

// 로그인한 사용자 프로필
export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

// 한 판의 퀴즈 점수 기록
export interface Score {
  id: string;
  user_id: string;
  score: number;
  total: number;
  points: number;
  percentage: number;
  testament: string | null;
  level: string | null;
  book_count: number | null;
  created_at: string;
}

// 랭킹(사용자별 집계) — DB의 leaderboard / leaderboard_weekly 뷰와 동일한 형태
export interface LeaderboardRow {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  plays: number;
  total_score: number;
  total_points: number;
  best_percentage: number;
  avg_percentage: number;
  last_played: string | null;
}

// 개인 오답 히스토리
export interface WrongAnswer {
  id: string;
  user_id: string;
  question_id: string | null;
  book: string | null;
  category: string | null;
  question: string;
  correct_answer: string;
  created_at: string;
}
