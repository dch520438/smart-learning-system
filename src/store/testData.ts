import { useAppStore } from './index';
import { v4 as uuidv4 } from 'uuid';

export function addTestData() {
  const { 
    addKnowledgePoint, 
    addNote, 
    addQuestion, 
    addMemorizeItem, 
    addTestRecord, 
    addPaper 
  } = useAppStore.getState();

  // 假设当前学科ID为第一个小学数学
  const subjectId = 'test-subject-id';

  // 添加测试知识点
  addKnowledgePoint({
    subjectId,
    title: '分数的基本性质',
    content: '<p>分数的分子和分母同时乘或除以相同的数（0除外），分数的大小不变。</p>',
    tags: ['分数', '基本性质'],
    images: []
  });

  addKnowledgePoint({
    subjectId,
    title: '三角形的面积',
    content: '<p>三角形的面积 = 底 × 高 ÷ 2</p>',
    tags: ['三角形', '面积'],
    images: []
  });

  // 添加测试笔记
  addNote({
    subjectId,
    title: '数学考试重点',
    content: '<p>1. 分数的四则运算</p><p>2. 三角形的面积计算</p><p>3. 解方程</p>',
    tags: ['考试', '重点'],
    images: []
  });

  // 添加测试题目
  addQuestion({
    subjectId,
    content: '计算：1/2 + 1/3 = ?',
    answer: '5/6',
    analysis: '通分后计算：3/6 + 2/6 = 5/6',
    difficulty: 'easy',
    knowledgePoints: ['分数', '加法'],
    type: 'fill',
    images: [],
    source: '课本',
    isMistake: false,
    isPattern: false
  });

  // 添加必背内容
  addMemorizeItem({
    subjectId,
    title: '乘法口诀表',
    content: '<p>一一得一</p><p>一二得二，二二得四</p><p>一三得三，二三得六，三三得九</p>',
    tags: ['乘法', '口诀'],
    images: []
  });

  // 添加测试记录
  addTestRecord({
    subjectId,
    title: '单元测试',
    score: 85,
    totalScore: 100,
    questions: [],
    answers: {},
    timeSpent: 600
  });

  // 添加试卷
  addPaper({
    subjectId,
    title: '期中考试',
    date: '2026-04-20',
    images: [],
    notes: '数学期中考试试卷'
  });

  console.log('测试数据添加完成');
}
