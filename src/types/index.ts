export type Level = 'primary' | 'middle' | 'high' | 'university';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'single' | 'multiple' | 'fill' | 'essay';

export interface Subject {
  id: string;
  name: string;
  level: Level;
  icon: string;
  color: string;
}

export interface KnowledgePoint {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  subjectId: string;
  content: string;
  answer: string;
  analysis: string;
  difficulty: Difficulty;
  knowledgePoints: string[];
  type: QuestionType;
  images: string[];
  source: string;
  isMistake: boolean;
  isPattern: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRecord {
  id: string;
  subjectId: string;
  title: string;
  score: number;
  totalScore: number;
  questions: string[];
  answers: Record<string, string>;
  timeSpent: number;
  createdAt: Date;
}

export interface StudyAnalysis {
  id: string;
  subjectId: string;
  weakPoints: string[];
  suggestions: string[];
  habits: Record<string, any>;
  createdAt: Date;
}

export interface MemorizeItem {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  isMemorized: boolean;
  createdAt: Date;
  updatedAt: Date;
}
