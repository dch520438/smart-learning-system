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
  const { currentLevel, setCurrentLevel, currentSubject, subjects, knowledgeItems, notes, mistakeItems, patternItems, currentUser, users, logout, switchUser } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelKey, setNewLevelKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    
    if (query.trim().length > 0 && currentSubject) {
      const results: any[] = [];
      
      // 搜索知识点
      knowledgeItems
        .filter(item => item.subjectId === currentSubject.id)
        .forEach(item => {
          if (item.title.toLowerCase().includes(query.toLowerCase()) || 
              item.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'knowledge',
              title: item.title,
              content: item.content.substring(0, 100) + '...',
              path: '/knowledge'
            });
          }
        });
      
      // 搜索笔记
      notes
        .filter(note => note.subjectId === currentSubject.id)
        .forEach(note => {
          if (note.title.toLowerCase().includes(query.toLowerCase()) || 
              note.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'notes',
              title: note.title,
              content: note.content.substring(0, 100) + '...',
              path: '/notes'
            });
          }
        });
      
      // 搜索必记必背
      const memorizeItemsFromStore = useAppStore.getState().memorizeItems;
      memorizeItemsFromStore
        .filter(item => item.subjectId === currentSubject.id)
        .forEach(item => {
          if (item.title.toLowerCase().includes(query.toLowerCase()) || 
              item.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'memorize',
              title: item.title,
              content: item.content.substring(0, 100) + '...',
              path: '/memorize'
            });
          }
        });
      
      // 搜索错题
      mistakeItems
        .filter(item => item.subjectId === currentSubject.id)
        .forEach(item => {
          if (item.question.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'mistakes',
              title: item.question.substring(0, 50) + '...',
              content: '错题',
              path: '/mistakes'
            });
          }
        });
      
      // 搜索母题
      patternItems
        .filter(item => item.subjectId === currentSubject.id)
        .forEach(item => {
          if (item.title.toLowerCase().includes(query.toLowerCase()) || 
              item.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'patterns',
              title: item.title,
              content: item.content.substring(0, 100) + '...',
              path: '/patterns'
            });
          }
        });
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result: any) => {
    navigate(result.path);
    setShowSearchResults(false);
    setSearchQuery('');
    setShowSearchBox(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧导航按钮 */}
          <button
            onClick={() => setShowNavMenu(!showNavMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="显示导航"
          >
            <Icon name={showNavMenu ? "x" : "menu"} size={24} />
          </button>

          {/* 品牌标识 */}
          <div className="flex-1 flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Icon name="brain" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                智慧学习
              </span>
            </Link>
          </div>

          {/* 右侧搜索按钮 */}
          <button
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="搜索"
          >
            <Icon name="search" size={24} />
          </button>
        </div>

        {/* 搜索框 */}
        {showSearchBox && (
          <div className="pb-4 relative">
            <form 
              className="relative w-full"
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
                autoFocus
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Icon name="search" size={20} />
              </button>
            </form>

            {/* 搜索结果 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon 
                            name={result.type === 'knowledge' ? 'book-open' : 
                                  result.type === 'notes' ? 'file-text' : 
                                  result.type === 'memorize' ? 'brain' : 
                                  result.type === 'mistakes' ? 'alert-triangle' : 'layers'} 
                            size={16} 
                            className="text-blue-500"
                          />
                          <span className="font-medium text-gray-800 dark:text-gray-200">{result.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {result.type === 'knowledge' ? '知识点' : 
                           result.type === 'notes' ? '笔记' : 
                           result.type === 'memorize' ? '必记必背' : 
                           result.type === 'mistakes' ? '错题' : '母题'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 导航菜单 */}
        {showNavMenu && (
          <div className="pb-4 border-t border-gray-200 dark:border-gray-800">
            {/* 年级选择 */}
            <div className="py-3">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {uniqueLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center whitespace-nowrap"
                >
                  <Icon name="plus" size={16} className="mr-1" />
                  添加年级
                </button>
              </div>
            </div>

            {/* 导航项目 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowNavMenu(false)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
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

            {/* 用户菜单 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {currentUser?.username.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {currentUser?.username || '用户'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      当前用户
                    </div>
                  </div>
                </div>
                <Icon name="chevron-down" size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
              
              {showUserMenu && (
                <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                  {/* 用户切换 */}
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">切换用户</p>
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setShowUserMenu(false);
                          setShowNavMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${currentUser?.id === user.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* 登出按钮 */}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/auth');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="log-out" size={16} />
                      <span>登出</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



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
