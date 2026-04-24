import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

const subjectFeatures = [
  { label: '知识归纳', icon: 'book-open-check', path: '/knowledge', color: '#3B82F6', desc: '整理和管理知识点' },
  { label: '学习笔记', icon: 'sticky-note', path: '/notes', color: '#10B981', desc: '记录学习心得' },
  { label: '必背必记', icon: 'brain', path: '/memorize', color: '#8B5CF6', desc: '重点内容记忆' },
  { label: '错题整理', icon: 'alert-triangle', path: '/mistakes', color: '#EF4444', desc: '收集和复习错题' },
  { label: '母题整理', icon: 'star', path: '/patterns', color: '#F59E0B', desc: '经典题型整理' },
  { label: '同考点归拢', icon: 'layers', path: '/same-point', color: '#06B6D4', desc: '按考点分类题目' },
  { label: '模拟测试', icon: 'play', path: '/test', color: '#EC4899', desc: '进行模拟考试' },
  { label: '做题模式', icon: 'target', path: '/practice', color: '#14B8A6', desc: '专项练习' },
  { label: '分数历史', icon: 'trending-up', path: '/scores', color: '#6366F1', desc: '查看成绩变化' },
  { label: '学习分析', icon: 'line-chart', path: '/analysis', color: '#F97316', desc: '智能学习分析' },
  { label: '思维导图', icon: 'network', path: '/mindmap', color: '#0EA5E9', desc: '知识可视化' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { currentSubject, knowledgePoints, questions, notes, testRecords } = useAppStore();

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectStats = {
    knowledge: knowledgePoints.filter((kp) => kp.subjectId === currentSubject.id).length,
    questions: questions.filter((q) => q.subjectId === currentSubject.id).length,
    mistakes: questions.filter((q) => q.subjectId === currentSubject.id && q.isMistake).length,
    notes: notes.filter((n) => n.subjectId === currentSubject.id).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: currentSubject.color + '20' }}
            >
              <Icon
                name={currentSubject.icon}
                size={48}
                style={{ color: currentSubject.color }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentSubject.name}</h1>
              <p className="text-gray-600 mt-1">管理你的学习内容</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '知识点', value: subjectStats.knowledge, icon: 'book-open-check', color: '#3B82F6' },
              { label: '题目', value: subjectStats.questions, icon: 'alert-triangle', color: '#EF4444' },
              { label: '错题', value: subjectStats.mistakes, icon: 'star', color: '#F59E0B' },
              { label: '笔记', value: subjectStats.notes, icon: 'sticky-note', color: '#10B981' },
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
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">学习功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={() => navigate(feature.path)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: feature.color + '20' }}
                  >
                    <Icon name={feature.icon} size={24} style={{ color: feature.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{feature.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
