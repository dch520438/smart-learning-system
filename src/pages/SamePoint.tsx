import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Question } from '../types';

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const difficultyColors: Record<string, string> = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export function SamePoint() {
  const navigate = useNavigate();
  const { currentSubject, questions } = useAppStore();
  const [expandedKnowledgePoint, setExpandedKnowledgePoint] = useState<string | null>(null);

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectQuestions = questions.filter((q) => q.subjectId === currentSubject.id);

  // 按知识点分组题目
  const knowledgePointMap = subjectQuestions.reduce((map, question) => {
    question.knowledgePoints.forEach((kp) => {
      if (!map.has(kp)) {
        map.set(kp, []);
      }
      map.get(kp)?.push(question);
    });
    return map;
  }, new Map<string, Question[]>());

  const knowledgePoints = Array.from(knowledgePointMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const toggleKnowledgePoint = (kp: string) => {
    if (expandedKnowledgePoint === kp) {
      setExpandedKnowledgePoint(null);
    } else {
      setExpandedKnowledgePoint(kp);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">同考点归拢</h1>
            <p className="text-gray-600 mt-1">按知识点归类整理题目</p>
          </div>
        </div>

        {knowledgePoints.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-cyan-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="layers" size={48} className="text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有知识点</h3>
            <p className="text-gray-600 mb-6">添加题目时设置知识点，系统会自动归类</p>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgePoints.map(([knowledgePoint, pointQuestions]) => (
              <div key={knowledgePoint} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleKnowledgePoint(knowledgePoint)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Icon name="layers" size={20} className="text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{knowledgePoint}</h3>
                      <p className="text-sm text-gray-500">{pointQuestions.length} 道题目</p>
                    </div>
                  </div>
                  <Icon
                    name={expandedKnowledgePoint === knowledgePoint ? 'chevron-down' : 'chevron-right'}
                    size={20}
                    className="text-gray-500"
                  />
                </button>

                {expandedKnowledgePoint === knowledgePoint && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="space-y-4">
                      {pointQuestions.map((question) => (
                        <div key={question.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <span
                                  className="px-3 py-1 rounded-full text-sm font-medium"
                                  style={{
                                    backgroundColor: difficultyColors[question.difficulty] + '20',
                                    color: difficultyColors[question.difficulty],
                                  }}
                                >
                                  {difficultyLabels[question.difficulty]}
                                </span>
                                {question.isMistake && (
                                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                    错题
                                  </span>
                                )}
                                {question.isPattern && (
                                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                    母题
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-800 mb-3 whitespace-pre-wrap">{question.content}</div>
                              {question.answer && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                  <h4 className="font-semibold text-green-800 text-sm mb-1">答案</h4>
                                  <p className="text-green-700 text-sm whitespace-pre-wrap">{question.answer}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
