import React, { useState } from 'react';
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
  { path: '/dashboard', label: '学科概览', icon: 'layout' },
  { path: '/knowledge', label: '知识归纳', icon: 'book-open' },
  { path: '/notes', label: '学习笔记', icon: 'file-text' },
  { path: '/memorize', label: '必背必记', icon: 'brain' },
  { path: '/mistakes', label: '错题整理', icon: 'alert-triangle' },
  { path: '/patterns', label: '母题整理', icon: 'layers' },
  { path: '/same-point', label: '同考点归拢', icon: 'hash' },
  { path: '/test', label: '模拟测试', icon: 'clipboard-list' },
  { path: '/practice', label: '做题模式', icon: 'pen-tool' },
  { path: '/scores', label: '分数历史', icon: 'trending-up' },
  { path: '/study', label: '学习记录', icon: 'clock' },
  { path: '/papers', label: '试卷收集', icon: 'file' },
  { path: '/scraper', label: '数据抓取', icon: 'globe' },
  { path: '/analysis', label: '学习分析', icon: 'line-chart' },
  { path: '/mindmap', label: '思维导图', icon: 'network' },
  { path: '/settings', label: '设置', icon: 'settings' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLevel, setCurrentLevel, currentSubject, subjects, knowledgePoints, notes, questions, memorizeItems } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelKey, setNewLevelKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 获取所有唯一的年级
  const uniqueLevels = Array.from(new Set(subjects.map(s => s.level)));

  // 年级标签映射
  const levelLabels: Record<string, string> = {
    primary: '小学',
    middle: '初中',
    high: '高中',
    university: '大学',
  };

  // 添加自定义年级标签
  uniqueLevels.forEach(level => {
    if (!levelLabels[level]) {
      levelLabels[level] = level;
    }
  });

  const handleAddLevel = () => {
    if (newLevelName.trim() && newLevelKey.trim()) {
      // 这里不需要添加到 store，只需要确保在添加学科时使用正确的年级键
      setShowAddLevelModal(false);
      setNewLevelName('');
      setNewLevelKey('');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(false);
  };

  const handleSearchResultClick = (result: any) => {
    navigate(result.path);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between h-auto md:h-16 py-4 md:py-0">
          {/* 品牌标识 */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Icon name="brain" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                智慧学习
              </span>
            </Link>
          </div>

          {/* 搜索框 */}
          <form 
            className="relative mb-4 md:mb-0 w-full md:w-64"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="搜索知识点、笔记、题目..."
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Icon name="search" size={18} />
            </button>
          </form>

          {/* 年级选择 */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            {uniqueLevels.map((level) => (
              <button
                key={level}
                onClick={() => setCurrentLevel(level)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentLevel === level
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {levelLabels[level]}
              </button>
            ))}
            <button
              onClick={() => setShowAddLevelModal(true)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
            >
              <Icon name="plus" size={14} className="mr-1" />
              添加年级
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name="menu" size={24} />
          </button>
        </div>

        {/* 桌面端导航菜单 */}
        <div className="hidden md:flex items-center justify-center space-x-1 py-2">
          {navItems.map((item, index) => (
            <React.Fragment key={item.path}>
              {index > 0 && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>}
              <Link
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
        <div className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
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
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {levelLabels[currentSubject.level]} · {currentSubject.name}
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
              >
                <Icon name="x" size={16} />
                <span>切换</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加年级模态框 */}
      {showAddLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">添加年级</h3>
              <button
                onClick={() => setShowAddLevelModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年级名称</label>
                <input
                  type="text"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  placeholder="请输入年级名称（如：学前班）"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年级键值</label>
                <input
                  type="text"
                  value={newLevelKey}
                  onChange={(e) => setNewLevelKey(e.target.value)}
                  placeholder="请输入年级键值（如：preschool）"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddLevelModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleAddLevel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
