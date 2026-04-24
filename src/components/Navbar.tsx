import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icons';
import { useAppStore } from '../store';

const levelLabels: Record<string, string> = {
  primary: '小学',
  middle: '初中',
  high: '高中',
  university: '大学',
};

const navItems = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/knowledge', label: '知识归纳', icon: 'book-open-check' },
  { path: '/notes', label: '学习笔记', icon: 'sticky-note' },
  { path: '/memorize', label: '必背必记', icon: 'brain' },
  { path: '/mistakes', label: '错题整理', icon: 'alert-triangle' },
  { path: '/patterns', label: '母题整理', icon: 'star' },
  { path: '/same-point', label: '同考点归拢', icon: 'layers' },
  { path: '/test', label: '模拟测试', icon: 'play' },
  { path: '/practice', label: '做题模式', icon: 'target' },
  { path: '/scores', label: '分数历史', icon: 'trending-up' },
  { path: '/analysis', label: '学习分析', icon: 'line-chart' },
  { path: '/mindmap', label: '思维导图', icon: 'network' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLevel, setCurrentLevel, currentSubject } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Icon name="brain" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                智慧学习
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {(['primary', 'middle', 'high', 'university'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setCurrentLevel(level)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {levelLabels[level]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {currentSubject && (
        <div className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: currentSubject.color + '20' }}
                >
                  <Icon
                    name={currentSubject.icon}
                    size={20}
                    style={{ color: currentSubject.color }}
                  />
                </div>
                <span className="font-medium text-gray-800">
                  {levelLabels[currentSubject.level]} · {currentSubject.name}
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Icon name="x" size={16} />
                <span>切换</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
