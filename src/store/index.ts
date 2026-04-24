import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, KnowledgePoint, Note, Question, TestRecord, StudyAnalysis, MemorizeItem, StudyRecord, Paper } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentLevel: Level;
  setCurrentLevel: (level: Level) => void;
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  
  subjects: Subject[];
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  notes: Note[];
  testRecords: TestRecord[];
  studyRecords: StudyRecord[];
  studyAnalyses: StudyAnalysis[];
  memorizeItems: MemorizeItem[];
  
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addKnowledgePoint: (kp: Omit<KnowledgePoint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKnowledgePoint: (id: string, kp: Partial<KnowledgePoint>) => void;
  deleteKnowledgePoint: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTestRecord: (record: Omit<TestRecord, 'id' | 'createdAt'>) => void;
  addStudyRecord: (record: Omit<StudyRecord, 'id' | 'createdAt'>) => void;
  updateStudyRecord: (id: string, record: Partial<StudyRecord>) => void;
  deleteStudyRecord: (id: string) => void;
  papers: Paper[];
  addPaper: (paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePaper: (id: string, paper: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
  addStudyAnalysis: (analysis: Omit<StudyAnalysis, 'id' | 'createdAt'>) => void;
  addMemorizeItem: (item: Omit<MemorizeItem, 'id' | 'createdAt' | 'updatedAt' | 'isMemorized'>) => void;
  updateMemorizeItem: (id: string, item: Partial<MemorizeItem>) => void;
  deleteMemorizeItem: (id: string) => void;
  toggleMemorizeStatus: (id: string) => void;
  
  // 数据管理相关
  setSubjects: (subjects: Subject[]) => void;
  setKnowledgePoints: (knowledgePoints: KnowledgePoint[]) => void;
  setNotes: (notes: Note[]) => void;
  setQuestions: (questions: Question[]) => void;
  setMemorizeItems: (memorizeItems: MemorizeItem[]) => void;
  setTestRecords: (testRecords: TestRecord[]) => void;
  setPapers: (papers: Paper[]) => void;
}

const initialSubjects: Subject[] = [
  { id: uuidv4(), name: '语文', level: 'primary', icon: 'book-open', color: '#EF4444' },
  { id: uuidv4(), name: '数学', level: 'primary', icon: 'calculator', color: '#3B82F6' },
  { id: uuidv4(), name: '英语', level: 'primary', icon: 'languages', color: '#10B981' },
  { id: uuidv4(), name: '科学', level: 'primary', icon: 'flask', color: '#F59E0B' },
  { id: uuidv4(), name: '语文', level: 'middle', icon: 'book-open', color: '#EF4444' },
  { id: uuidv4(), name: '数学', level: 'middle', icon: 'calculator', color: '#3B82F6' },
  { id: uuidv4(), name: '英语', level: 'middle', icon: 'languages', color: '#10B981' },
  { id: uuidv4(), name: '物理', level: 'middle', icon: 'zap', color: '#8B5CF6' },
  { id: uuidv4(), name: '化学', level: 'middle', icon: 'flask', color: '#F59E0B' },
  { id: uuidv4(), name: '生物', level: 'middle', icon: 'leaf', color: '#14B8A6' },
  { id: uuidv4(), name: '历史', level: 'middle', icon: 'history', color: '#EC4899' },
  { id: uuidv4(), name: '地理', level: 'middle', icon: 'globe', color: '#06B6D4' },
  { id: uuidv4(), name: '政治', level: 'middle', icon: 'landmark', color: '#6366F1' },
  { id: uuidv4(), name: '语文', level: 'high', icon: 'book-open', color: '#EF4444' },
  { id: uuidv4(), name: '数学', level: 'high', icon: 'calculator', color: '#3B82F6' },
  { id: uuidv4(), name: '英语', level: 'high', icon: 'languages', color: '#10B981' },
  { id: uuidv4(), name: '物理', level: 'high', icon: 'zap', color: '#8B5CF6' },
  { id: uuidv4(), name: '化学', level: 'high', icon: 'flask', color: '#F59E0B' },
  { id: uuidv4(), name: '生物', level: 'high', icon: 'leaf', color: '#14B8A6' },
  { id: uuidv4(), name: '历史', level: 'high', icon: 'history', color: '#EC4899' },
  { id: uuidv4(), name: '地理', level: 'high', icon: 'globe', color: '#06B6D4' },
  { id: uuidv4(), name: '政治', level: 'high', icon: 'landmark', color: '#6366F1' },
  { id: uuidv4(), name: '高等数学', level: 'university', icon: 'calculator', color: '#3B82F6' },
  { id: uuidv4(), name: '线性代数', level: 'university', icon: 'grid', color: '#8B5CF6' },
  { id: uuidv4(), name: '概率论', level: 'university', icon: 'dice', color: '#10B981' },
  { id: uuidv4(), name: '大学物理', level: 'university', icon: 'zap', color: '#F59E0B' },
  { id: uuidv4(), name: '计算机基础', level: 'university', icon: 'computer', color: '#06B6D4' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentLevel: 'primary',
      setCurrentLevel: (level) => set({ currentLevel: level }),
      currentSubject: null,
      setCurrentSubject: (subject) => set({ currentSubject: subject }),
      
      subjects: initialSubjects,
    knowledgePoints: [],
    questions: [],
    notes: [],
    testRecords: [],
    studyRecords: [],
    papers: [],
    studyAnalyses: [],
    memorizeItems: [],
      
      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, { ...subject, id: uuidv4() }]
      })),
      
      addKnowledgePoint: (kp) => set((state) => ({
        knowledgePoints: [...state.knowledgePoints, {
          ...kp,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      })),
      
      updateKnowledgePoint: (id, kp) => set((state) => ({
        knowledgePoints: state.knowledgePoints.map(item =>
          item.id === id ? { ...item, ...kp, updatedAt: new Date() } : item
        )
      })),
      
      deleteKnowledgePoint: (id) => set((state) => ({
        knowledgePoints: state.knowledgePoints.filter(item => item.id !== id)
      })),
      
      addQuestion: (question) => set((state) => ({
        questions: [...state.questions, {
          ...question,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      })),
      
      updateQuestion: (id, question) => set((state) => ({
        questions: state.questions.map(item =>
          item.id === id ? { ...item, ...question, updatedAt: new Date() } : item
        )
      })),
      
      deleteQuestion: (id) => set((state) => ({
        questions: state.questions.filter(item => item.id !== id)
      })),
      
      addNote: (note) => set((state) => ({
        notes: [...state.notes, {
          ...note,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      })),
      
      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map(item =>
          item.id === id ? { ...item, ...note, updatedAt: new Date() } : item
        )
      })),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(item => item.id !== id)
      })),
      
      addTestRecord: (record) => set((state) => ({
        testRecords: [...state.testRecords, {
          ...record,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      addStudyRecord: (record) => set((state) => ({
        studyRecords: [...state.studyRecords, {
          ...record,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      updateStudyRecord: (id, record) => set((state) => ({
        studyRecords: state.studyRecords.map(item =>
          item.id === id ? { ...item, ...record } : item
        )
      })),
      
      deleteStudyRecord: (id) => set((state) => ({
        studyRecords: state.studyRecords.filter(item => item.id !== id)
      })),
      
      addPaper: (paper) => set((state) => ({
        papers: [...state.papers, {
          ...paper,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),
      
      updatePaper: (id, paper) => set((state) => ({
        papers: state.papers.map(item =>
          item.id === id ? { ...item, ...paper, updatedAt: new Date().toISOString() } : item
        )
      })),
      
      deletePaper: (id) => set((state) => ({
        papers: state.papers.filter(item => item.id !== id)
      })),
      
      addStudyAnalysis: (analysis) => set((state) => ({
        studyAnalyses: [...state.studyAnalyses, {
          ...analysis,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      addMemorizeItem: (item) => set((state) => ({
        memorizeItems: [...state.memorizeItems, {
          ...item,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isMemorized: false
        }]
      })),
      updateMemorizeItem: (id, item) => set((state) => ({
        memorizeItems: state.memorizeItems.map(i =>
          i.id === id ? { ...i, ...item, updatedAt: new Date() } : i
        )
      })),
      deleteMemorizeItem: (id) => set((state) => ({
        memorizeItems: state.memorizeItems.filter(i => i.id !== id)
      })),
      toggleMemorizeStatus: (id) => set((state) => ({
        memorizeItems: state.memorizeItems.map(i =>
          i.id === id ? { ...i, isMemorized: !i.isMemorized, updatedAt: new Date() } : i
        )
      })),
      
      // 数据管理相关
      setSubjects: (subjects) => set({ subjects }),
      setKnowledgePoints: (knowledgePoints) => set({ knowledgePoints }),
      setNotes: (notes) => set({ notes }),
      setQuestions: (questions) => set({ questions }),
      setMemorizeItems: (memorizeItems) => set({ memorizeItems }),
      setTestRecords: (testRecords) => set({ testRecords }),
      setPapers: (papers) => set({ papers }),
    }),
    {
      name: 'study-app-storage',
    }
  )
);
