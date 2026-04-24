import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Subject } from '../types';

const levelLabels: Record<string, string> = {
  primary: '小学',
  middle: '初中',
  high: '高中',
  university: '大学',
};

const quickActions = [
  { label: '知识归纳', icon: 'book-open-check', path: '/knowledge', color: '#3B82F6' },
  { label: '错题整理', icon: 'alert-triangle', path: '/mistakes', color: '#EF4444' },
  { label: '学习笔记', icon: 'sticky-note', path: '/notes', color: '#10B981' },
  { label: '学习分析', icon: 'line-chart', path: '/analysis', color: '#F59E0B' },
];

export function Home() {
  const navigate = useNavigate();
  const { currentLevel, subjects, setCurrentSubject, knowledgePoints, questions, notes, testRecords } = useAppStore();

  const levelSubjects = subjects.filter((s) => s.level === currentLevel);

  const stats = {
    knowledge: knowledgePoints.length,
    questions: questions.length,
    notes: notes.length,
    tests: testRecords.length,
  };

  const handleSubjectClick = (subject: Subject) => {
    setCurrentSubject(subject);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到<span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">智慧学习</span>
          </h1>
          <p className="text-xl text-gray-600">系统化整理知识，高效提升学习成绩</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: '知识点', value: stats.knowledge, icon: 'book-open-check', color: '#3B82F6' },
            { label: '题目', value: stats.questions, icon: 'alert-triangle', color: '#EF4444' },
            { label: '笔记', value: stats.notes, icon: 'sticky-note', color: '#10B981' },
            { label: '测试', value: stats.tests, icon: 'play', color: '#F59E0B' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                  <Icon name={stat.icon} size={24} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">快速操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: action.color + '20' }}>
                  <Icon name={action.icon} size={32} style={{ color: action.color }} />
                </div>
                <div className="text-center font-medium text-gray-800">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            选择{levelLabels[currentLevel]}学科
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: subject.color + '20' }}
                >
                  <Icon
                    name={subject.icon}
                    size={36}
                    style={{ color: subject.color }}
                  />
                </div>
                <div className="text-center font-medium text-gray-800 text-lg">
                  {subject.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
