import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

type ThemeMode = 'light' | 'dark' | 'system';
type BackgroundColor = 'default' | 'blue' | 'green' | 'purple' | 'orange';

export function Settings() {
  const { currentUser, users, updateUser, deleteUser, subjects, knowledgePoints, notes, questions, memorizeItems, testRecords, papers, setSubjects, setKnowledgePoints, setNotes, setQuestions, setMemorizeItems, setTestRecords, setPapers } = useAppStore();
  
  // 账号编辑相关状态
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'system';
  });
  
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>(() => {
    const saved = localStorage.getItem('backgroundColor');
    return (saved as BackgroundColor) || 'default';
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    applyTheme();
  }, [themeMode, backgroundColor]);

  const applyTheme = () => {
    // 应用主题模式
    let isDark = false;
    if (themeMode === 'dark') {
      isDark = true;
    } else if (themeMode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.documentElement.classList.toggle('dark', isDark);
    
    // 应用背景颜色
    document.documentElement.classList.remove('bg-default', 'bg-blue', 'bg-green', 'bg-purple', 'bg-orange');
    document.documentElement.classList.add(`bg-${backgroundColor}`);
    
    // 也直接设置body样式，确保生效
    let bgColor = '#f9fafb';
    if (backgroundColor === 'blue') bgColor = '#eff6ff';
    else if (backgroundColor === 'green') bgColor = '#f0fdf4';
    else if (backgroundColor === 'purple') bgColor = '#faf5ff';
    else if (backgroundColor === 'orange') bgColor = '#fff7ed';
    
    if (isDark) {
      if (backgroundColor === 'default') bgColor = '#111827';
      else if (backgroundColor === 'blue') bgColor = '#1e3a5f';
      else if (backgroundColor === 'green') bgColor = '#14532d';
      else if (backgroundColor === 'purple') bgColor = '#3b0764';
      else if (backgroundColor === 'orange') bgColor = '#431407';
    }
    document.body.style.backgroundColor = bgColor;
    
    // 保存设置
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('backgroundColor', backgroundColor);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleBackgroundColorChange = (color: BackgroundColor) => {
    setBackgroundColor(color);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleBackupData = () => {
    const data = {
      subjects,
      knowledgePoints,
      notes,
      questions,
      memorizeItems,
      testRecords,
      papers,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('数据备份成功！');
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.subjects) setSubjects(data.subjects);
        if (data.knowledgePoints) setKnowledgePoints(data.knowledgePoints);
        if (data.notes) setNotes(data.notes);
        if (data.questions) setQuestions(data.questions);
        if (data.memorizeItems) setMemorizeItems(data.memorizeItems);
        if (data.testRecords) setTestRecords(data.testRecords);
        if (data.papers) setPapers(data.papers);
        showSuccess('数据恢复成功！');
      } catch (error) {
        alert('数据恢复失败，请检查文件格式！');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    setConfirmAction('clear');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'clear') {
      setSubjects([]);
      setKnowledgePoints([]);
      setNotes([]);
      setQuestions([]);
      setMemorizeItems([]);
      setTestRecords([]);
      setPapers([]);
      showSuccess('数据已清空！');
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleExportData = () => {
    const data = {
      subjects,
      knowledgePoints,
      notes,
      questions,
      memorizeItems,
      testRecords,
      papers,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-learning-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('数据导出成功！');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.subjects) setSubjects(data.subjects);
        if (data.knowledgePoints) setKnowledgePoints(data.knowledgePoints);
        if (data.notes) setNotes(data.notes);
        if (data.questions) setQuestions(data.questions);
        if (data.memorizeItems) setMemorizeItems(data.memorizeItems);
        if (data.testRecords) setTestRecords(data.testRecords);
        if (data.papers) setPapers(data.papers);
        showSuccess('数据导入成功！');
      } catch (error) {
        alert('数据导入失败，请检查文件格式！');
      }
    };
    reader.readAsText(file);
  };
  
  // 账号管理相关函数
  const handleEditAccount = () => {
    if (!currentUser) return;
    setEditUsername(currentUser.username);
    setEditEmail(currentUser.email);
    setEditPassword('');
    setEditNickname(currentUser.nickname || '');
    setEditBio(currentUser.bio || '');
    setEditGrade(currentUser.grade || '');
    setShowEditAccountModal(true);
  };
  
  const handleUpdateAccount = () => {
    if (!currentUser) return;
    
    const userData: Partial<Record<string, any>> = {};
    if (editUsername) userData.username = editUsername;
    if (editEmail) userData.email = editEmail;
    if (editPassword) userData.password = editPassword;
    if (editNickname || editNickname === '') userData.nickname = editNickname || undefined;
    if (editBio || editBio === '') userData.bio = editBio || undefined;
    if (editGrade || editGrade === '') userData.grade = editGrade || undefined;
    
    const success = updateUser(currentUser.id, userData);
    if (success) {
      showSuccess('账号信息更新成功！');
      setShowEditAccountModal(false);
    } else {
      alert('邮箱已被其他用户使用！');
    }
  };
  
  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };
  
  const confirmDeleteAccount = () => {
    if (!currentUser) return;
    deleteUser(currentUser.id);
    showSuccess('账号已删除！');
    setShowDeleteAccountModal(false);
  };

  const backgroundColorOptions = [
    { value: 'default', label: '默认', color: 'bg-gray-50' },
    { value: 'blue', label: '蓝色', color: 'bg-blue-50' },
    { value: 'green', label: '绿色', color: 'bg-green-50' },
    { value: 'purple', label: '紫色', color: 'bg-purple-50' },
    { value: 'orange', label: '橙色', color: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
          <p className="text-gray-600">个性化设置和数据管理</p>
        </div>

        {/* 账号管理 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="user" size={24} className="mr-2 text-indigo-500" />
            账号管理
          </h2>
          
          {currentUser && (
            <div className="space-y-4">
              {/* 当前账号信息 */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {currentUser.nickname?.charAt(0).toUpperCase() || currentUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentUser.nickname || currentUser.username}
                    <span className="text-sm font-normal text-gray-500 ml-2">@{currentUser.username}</span>
                  </h3>
                  <p className="text-gray-600">{currentUser.email}</p>
                  {currentUser.grade && (
                    <p className="text-sm text-gray-500">年级：{currentUser.grade}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    注册时间：{new Date(currentUser.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
              
              {/* 个人简介 */}
              {currentUser.bio && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">{currentUser.bio}</p>
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleEditAccount}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="edit" size={18} />
                  <span>编辑账号</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="trash2" size={18} />
                  <span>注销账号</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 主题设置 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="settings" size={24} className="mr-2 text-indigo-500" />
            主题设置
          </h2>

          <div className="space-y-6">
            {/* 主题模式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">主题模式</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                    themeMode === 'light'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon name="sun" size={18} />
                  <span>浅色模式</span>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                    themeMode === 'dark'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon name="moon" size={18} />
                  <span>深色模式</span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                    themeMode === 'system'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon name="laptop" size={18} />
                  <span>跟随系统</span>
                </button>
              </div>
            </div>

            {/* 背景颜色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">背景颜色</label>
              <div className="grid grid-cols-5 gap-3">
                {backgroundColorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBackgroundColorChange(option.value as BackgroundColor)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      backgroundColor === option.value
                        ? 'border-indigo-500 scale-110 shadow-md'
                        : 'border-gray-300 hover:border-indigo-300 hover:scale-105'
                    } ${option.color}`}
                    title={option.label}
                  >
                    {backgroundColor === option.value && (
                      <Icon name="check" size={24} className="text-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="database" size={24} className="mr-2 text-indigo-500" />
            数据管理
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleBackupData}
                className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Icon name="download" size={18} />
                <span>备份数据</span>
              </button>
              <label className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
                <Icon name="upload" size={18} />
                <span>恢复数据</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Icon name="file-json" size={18} />
                <span>导出数据</span>
              </button>
              <label className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
                <Icon name="file-json" size={18} />
                <span>导入数据</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleClearData}
              className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2 w-full"
            >
              <Icon name="trash2" size={18} />
              <span>清空所有数据</span>
            </button>
          </div>
        </div>

        {/* 关于 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="info" size={24} className="mr-2 text-indigo-500" />
            关于
          </h2>

          <div className="space-y-3 text-gray-600">
            <p>智慧学习整理系统 v1.0.0</p>
            <p>全学科学习管理平台，支持小学、初中、高中、大学的所有学科</p>
            <p className="text-sm text-gray-500">© 2026 智慧学习整理系统</p>
          </div>
        </div>
      </div>

      {/* 确认模态框 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Icon name="alert-triangle" size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">确认操作</h3>
                <p className="text-gray-600">
                  {confirmAction === 'clear' && '确定要清空所有数据吗？此操作不可恢复！'}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 编辑账号模态框 */}
      {showEditAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">编辑账号</h3>
                <button
                  onClick={() => setShowEditAccountModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="x" size={24} />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="您的昵称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择年级</option>
                    <option value="小学一年级">小学一年级</option>
                    <option value="小学二年级">小学二年级</option>
                    <option value="小学三年级">小学三年级</option>
                    <option value="小学四年级">小学四年级</option>
                    <option value="小学五年级">小学五年级</option>
                    <option value="小学六年级">小学六年级</option>
                    <option value="初一">初一</option>
                    <option value="初二">初二</option>
                    <option value="初三">初三</option>
                    <option value="高一">高一</option>
                    <option value="高二">高二</option>
                    <option value="高三">高三</option>
                    <option value="大学">大学</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="简单介绍一下自己..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">密码（留空则不修改）</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="新密码"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditAccountModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAccount}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* 删除账号确认模态框 */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Icon name="alert-triangle" size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">注销账号</h3>
                <p className="text-gray-600 mb-4">
                  确定要注销此账号吗？此操作将删除该账号下的所有数据，且不可恢复！
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  确认注销
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <Icon name="check-circle" size={20} />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
