import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Level, Subject, KnowledgePoint, Note, Question, TestRecord, StudyAnalysis, MemorizeItem, StudyRecord, Paper, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // 用户认证相关
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUser: (userId: string, userData: Partial<User>) => boolean;
  deleteUser: (userId: string) => boolean;
  
  // 应用状态
  currentLevel: Level;
  setCurrentLevel: (level: Level) => void;
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  
  // 数据
  subjects: Subject[];
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  notes: Note[];
  testRecords: TestRecord[];
  studyRecords: StudyRecord[];
  studyAnalyses: StudyAnalysis[];
  memorizeItems: MemorizeItem[];
  papers: Paper[];
  
  // 别名属性（用于兼容代码中的引用）
  knowledgeItems: KnowledgePoint[];
  mistakeItems: Question[];
  patternItems: Question[];
  
  // 数据操作
  addSubject: (subject: Omit<Subject, 'id' | 'userId'>) => void;
  addKnowledgePoint: (kp: Omit<KnowledgePoint, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateKnowledgePoint: (id: string, kp: Partial<KnowledgePoint>) => void;
  deleteKnowledgePoint: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTestRecord: (record: Omit<TestRecord, 'id' | 'createdAt' | 'userId'>) => void;
  updateTestRecord: (id: string, record: Partial<TestRecord>) => void;
  deleteTestRecord: (id: string) => void;
  addStudyRecord: (record: Omit<StudyRecord, 'id' | 'createdAt' | 'userId'>) => void;
  updateStudyRecord: (id: string, record: Partial<StudyRecord>) => void;
  deleteStudyRecord: (id: string) => void;
  addPaper: (paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updatePaper: (id: string, paper: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
  addStudyAnalysis: (analysis: Omit<StudyAnalysis, 'id' | 'createdAt' | 'userId'>) => void;
  addMemorizeItem: (item: Omit<MemorizeItem, 'id' | 'createdAt' | 'updatedAt' | 'isMemorized' | 'userId'>) => void;
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



export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户认证相关
      isAuthenticated: false,
      currentUser: null,
      users: [],
      
      login: (email, password) => {
        const { users } = get();
        const user = users.find(u => u.email === email && (u.password === password || password === ''));
        if (user) {
          set({ isAuthenticated: true, currentUser: user });
          return true;
        }
        return false;
      },
      
      register: (username, email, password) => {
        const { users } = get();
        if (users.some(u => u.email === email)) {
          return false;
        }
        const newUser: User = {
          id: uuidv4(),
          username,
          email,
          password,
          createdAt: new Date()
        };
        set({ users: [...users, newUser], isAuthenticated: true, currentUser: newUser });
        return true;
      },
      
      logout: () => {
        set({ isAuthenticated: false, currentUser: null });
      },
      
      switchUser: (userId) => {
        const { users } = get();
        const user = users.find(u => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },
      
      updateUser: (userId, userData) => {
        const { users, currentUser } = get();
        // 检查邮箱是否已被其他用户使用
        if (userData.email && users.some(u => u.id !== userId && u.email === userData.email)) {
          return false;
        }
        // 更新用户
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        );
        // 如果更新的是当前用户，也更新currentUser
        const updatedCurrentUser = currentUser?.id === userId 
          ? { ...currentUser, ...userData }
          : currentUser;
        set({ users: updatedUsers, currentUser: updatedCurrentUser });
        return true;
      },
      
      deleteUser: (userId) => {
        const { users, currentUser, subjects, knowledgePoints, questions, notes, 
                testRecords, studyRecords, memorizeItems, papers, studyAnalyses } = get();
        // 删除该用户的所有数据
        const filteredUsers = users.filter(u => u.id !== userId);
        const filteredSubjects = subjects.filter(s => s.userId !== userId);
        const filteredKnowledgePoints = knowledgePoints.filter(kp => kp.userId !== userId);
        const filteredQuestions = questions.filter(q => q.userId !== userId);
        const filteredNotes = notes.filter(n => n.userId !== userId);
        const filteredTestRecords = testRecords.filter(t => t.userId !== userId);
        const filteredStudyRecords = studyRecords.filter(s => s.userId !== userId);
        const filteredMemorizeItems = memorizeItems.filter(m => m.userId !== userId);
        const filteredPapers = papers.filter(p => p.userId !== userId);
        const filteredStudyAnalyses = studyAnalyses.filter(a => a.userId !== userId);
        
        // 如果删除的是当前用户，需要登出
        const updatedState: Partial<AppState> = {
          users: filteredUsers,
          subjects: filteredSubjects,
          knowledgePoints: filteredKnowledgePoints,
          questions: filteredQuestions,
          notes: filteredNotes,
          testRecords: filteredTestRecords,
          studyRecords: filteredStudyRecords,
          memorizeItems: filteredMemorizeItems,
          papers: filteredPapers,
          studyAnalyses: filteredStudyAnalyses
        };
        
        if (currentUser?.id === userId) {
          updatedState.isAuthenticated = false;
          updatedState.currentUser = null;
        }
        
        set(updatedState as AppState);
        return true;
      },
      
      // 应用状态
      currentLevel: 'primary',
      setCurrentLevel: (level) => set({ currentLevel: level }),
      currentSubject: null,
      setCurrentSubject: (subject) => set({ currentSubject: subject }),
      
      // 数据
      subjects: [],
      knowledgePoints: [],
      questions: [],
      notes: [],
      testRecords: [],
      studyRecords: [],
      papers: [],
      studyAnalyses: [],
      memorizeItems: [],
      
      // 别名属性（用于兼容代码中的引用）
      knowledgeItems: [],
      mistakeItems: [],
      patternItems: [],
      
      // 数据操作
      addSubject: (subject) => set((state) => {
        if (!state.currentUser) return state;
        return {
          subjects: [...state.subjects, { ...subject, id: uuidv4(), userId: state.currentUser.id }]
        };
      }),
      
      addKnowledgePoint: (kp) => set((state) => {
        if (!state.currentUser) return state;
        return {
          knowledgePoints: [...state.knowledgePoints, {
            ...kp,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        };
      }),
      
      updateKnowledgePoint: (id, kp) => set((state) => ({
        knowledgePoints: state.knowledgePoints.map(item =>
          item.id === id ? { ...item, ...kp, updatedAt: new Date() } : item
        )
      })),
      
      deleteKnowledgePoint: (id) => set((state) => ({
        knowledgePoints: state.knowledgePoints.filter(item => item.id !== id)
      })),
      
      addQuestion: (question) => set((state) => {
        if (!state.currentUser) return state;
        return {
          questions: [...state.questions, {
            ...question,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        };
      }),
      
      updateQuestion: (id, question) => set((state) => ({
        questions: state.questions.map(item =>
          item.id === id ? { ...item, ...question, updatedAt: new Date() } : item
        )
      })),
      
      deleteQuestion: (id) => set((state) => ({
        questions: state.questions.filter(item => item.id !== id)
      })),
      
      addNote: (note) => set((state) => {
        if (!state.currentUser) return state;
        return {
          notes: [...state.notes, {
            ...note,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        };
      }),
      
      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map(item =>
          item.id === id ? { ...item, ...note, updatedAt: new Date() } : item
        )
      })),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(item => item.id !== id)
      })),
      
      addTestRecord: (record) => set((state) => {
        if (!state.currentUser) return state;
        return {
          testRecords: [...state.testRecords, {
            ...record,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date().toISOString()
          }]
        };
      }),
      
      updateTestRecord: (id, record) => set((state) => ({
        testRecords: state.testRecords.map(item =>
          item.id === id ? { ...item, ...record } : item
        )
      })),
      
      deleteTestRecord: (id) => set((state) => ({
        testRecords: state.testRecords.filter(item => item.id !== id)
      })),
      
      addStudyRecord: (record) => set((state) => {
        if (!state.currentUser) return state;
        return {
          studyRecords: [...state.studyRecords, {
            ...record,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date().toISOString()
          }]
        };
      }),
      
      updateStudyRecord: (id, record) => set((state) => ({
        studyRecords: state.studyRecords.map(item =>
          item.id === id ? { ...item, ...record } : item
        )
      })),
      
      deleteStudyRecord: (id) => set((state) => ({
        studyRecords: state.studyRecords.filter(item => item.id !== id)
      })),
      
      addPaper: (paper) => set((state) => {
        if (!state.currentUser) return state;
        return {
          papers: [...state.papers, {
            ...paper,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        };
      }),
      
      updatePaper: (id, paper) => set((state) => ({
        papers: state.papers.map(item =>
          item.id === id ? { ...item, ...paper, updatedAt: new Date().toISOString() } : item
        )
      })),
      
      deletePaper: (id) => set((state) => ({
        papers: state.papers.filter(item => item.id !== id)
      })),
      
      addStudyAnalysis: (analysis) => set((state) => {
        if (!state.currentUser) return state;
        return {
          studyAnalyses: [...state.studyAnalyses, {
            ...analysis,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date()
          }]
        };
      }),
      
      addMemorizeItem: (item) => set((state) => {
        if (!state.currentUser) return state;
        return {
          memorizeItems: [...state.memorizeItems, {
            ...item,
            id: uuidv4(),
            userId: state.currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isMemorized: false
          }]
        };
      }),
      
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
