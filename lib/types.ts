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
  created_at: string;
}
