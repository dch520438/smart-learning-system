import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Subject } from '../types';

// 年级标签映射
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
  const { currentLevel, subjects, setCurrentSubject, addSubject, knowledgePoints, questions, notes, testRecords } = useAppStore();

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('book-open');
  const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

  const levelSubjects = subjects.filter((s) => s.level === currentLevel);

  const stats = {
    knowledge: knowledgePoints.length,
    questions: questions.length,
    notes: notes.length,
    tests: testRecords.length,
  };

  // 获取易错知识（错题数量最多的知识点）
  const getErrorProneKnowledge = () => {
    const knowledgePointErrors = new Map<string, number>();
    
    questions.forEach((q) => {
      if (q.isMistake) {
        q.knowledgePoints.forEach((kp) => {
          knowledgePointErrors.set(kp, (knowledgePointErrors.get(kp) || 0) + 1);
        });
      }
    });
    
    return Array.from(knowledgePointErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const errorProneKnowledge = getErrorProneKnowledge();

  const handleSubjectClick = (subject: Subject) => {
    setCurrentSubject(subject);
    navigate('/dashboard');
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject({
        name: newSubjectName.trim(),
        level: currentLevel,
        icon: newSubjectIcon,
        color: newSubjectColor,
      });
      setShowAddSubjectModal(false);
      setNewSubjectName('');
      setNewSubjectIcon('book-open');
      setNewSubjectColor('#3B82F6');
    }
  };

  const availableIcons = [
    'book-open', 'calculator', 'languages', 'flask', 'zap', 'leaf', 'history', 'globe', 'landmark', 'grid', 'dice', 'computer',
  ];

  const availableColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#6366F1',
  ];

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

        {errorProneKnowledge.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="alert-circle" size={24} className="text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">易错知识提醒</h2>
            </div>
            <div className="space-y-3">
              {errorProneKnowledge.map(([knowledgePoint, errorCount], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold">{index + 1}</span>
                    </div>
                    <span className="text-gray-800">{knowledgePoint}</span>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {errorCount} 次错误
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              选择{levelLabels[currentLevel]}学科
            </h2>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Icon name="plus" size={18} className="mr-2" />
              添加学科
            </button>
          </div>
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

        {/* 添加学科模态框 */}
        {showAddSubjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">添加学科</h3>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="x" size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学科名称</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="请输入学科名称"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择图标</label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewSubjectIcon(icon)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${newSubjectIcon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Icon name={icon} size={24} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择颜色</label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewSubjectColor(color)}
                        className={`w-8 h-8 rounded-full ${newSubjectColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
