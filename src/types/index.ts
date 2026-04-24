export type Level = string;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'single' | 'multiple' | 'fill' | 'essay';

export interface Subject {
  id: string;
  userId: string;
  name: string;
  level: Level;
  icon: string;
  color: string;
}

export interface KnowledgePoint {
  id: string;
  userId: string;
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
  userId: string;
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
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  category: 'method' | 'note' | 'skill' | 'habit';
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRecord {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  score: number;
  totalScore: number;
  questions: string[];
  answers: Record<string, string>;
  timeSpent: number;
  createdAt: string;
}

export interface StudyRecord {
  id: string;
  userId: string;
  subjectId: string;
  duration: number; // 学习时长（分钟）
  startTime: string;
  endTime: string;
  focusLevel: 'low' | 'medium' | 'high'; // 专注程度
  activities: string[]; // 学习活动
  notes?: string; // 备注
  createdAt: string;
}

export interface Paper {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  date: string;
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyAnalysis {
  id: string;
  userId: string;
  subjectId: string;
  weakPoints: string[];
  suggestions: string[];
  habits: Record<string, any>;
  createdAt: Date;
}

export interface MemorizeItem {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  isMemorized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
}
