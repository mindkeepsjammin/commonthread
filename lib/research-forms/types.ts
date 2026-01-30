export type QuestionType = 'single_select' | 'multi_select' | 'short_answer' | 'reflection' | 'consent';

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  hint?: string;
  options?: Option[];
  required?: boolean;
  maxSelections?: number; // For multi_select questions with limits
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface ResearchFormData {
  id: string;
  title: string;
  subtitle?: string;
  openingFrame: {
    paragraphs: string[];
    consentText: string;
  };
  sections: FormSection[];
  closingNote?: string; // Internal note, not shown to users
}
