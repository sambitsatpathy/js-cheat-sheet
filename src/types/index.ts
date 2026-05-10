export type Section = 'claude';
export type Mode = 'study' | 'quiz';

export interface AppView {
  section: Section;
  mode: Mode;
}

export interface FlashcardItem {
  id: string;
  question: string;
  code?: string;
  codeLanguage?: string;
  parentId?: string;
}

export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: string;
  scenario: string;
  question: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}
