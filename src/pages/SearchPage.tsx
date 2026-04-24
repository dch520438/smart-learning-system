import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { KnowledgePoint, Note, Question, MemorizeItem } from '../types';

export function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { knowledgePoints, notes, questions, memorizeItems } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    knowledge: [] as KnowledgePoint[],
    note: [] as Note[],
    question: [] as Question[],
    memorize: [] as MemorizeItem[]
  });
  const [showMode, setShowMode] = useState<'card' | 'list'>('card');

  // 从URL中获取搜索查询
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';
    setQuery(searchQuery);
    performSearch(searchQuery);
  }, [location.search]);

  // 执行搜索
  const performSearch = (searchQuery: string) => {
    if (!searchQuery) {
      setResults({
        knowledge: [],
        note: [],
        question: [],
        memorize: []
      });
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // 搜索知识点
    const knowledgeResults = knowledgePoints.filter(kp => 
      kp.title.toLowerCase().includes(lowerQuery) || 
      kp.content.toLowerCase().includes(lowerQuery)
    );

    // 搜索笔记
    const noteResults = notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery)
    );

    // 搜索题目
    const questionResults = questions.filter(question => 
      question.content.toLowerCase().includes(lowerQuery) || 
      question.answer.toLowerCase().includes(lowerQuery)
    );

    // 搜索必背内容
    const memorizeResults = memorizeItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.content.toLowerCase().includes(lowerQuery)
    );

    setResults({
      knowledge: knowledgeResults,
      note: noteResults,
      question: questionResults,
      memorize: memorizeResults
    });
  };

  // 处理搜索表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // 计算总结果数
  const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0);

  // 渲染结果项
  const renderResultItem = (item: any, type: string) => {
    if (showMode === 'card') {
      return (
        <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  type === 'knowledge' ? 'bg-blue-100' :
                  type === 'note' ? 'bg-green-100' :
                  type === 'question' ? 'bg-purple-100' :
                  'bg-amber-100'
                }`}>
                  <Icon 
                    name={
                      type === 'knowledge' ? 'book-open-check' :
                      type === 'note' ? 'sticky-note' :
                      type === 'question' ? 'help-circle' :
                      'brain'
                    } 
                    size={18} 
                    className={
                      type === 'knowledge' ? 'text-blue-600' :
                      type === 'note' ? 'text-green-600' :
                      type === 'question' ? 'text-purple-600' :
                      'text-amber-600'
                    } 
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {type === 'question' ? `${item.content.substring(0, 50)}...` : item.title}
                </h3>
              </div>
              <div className="text-gray-700 text-sm mb-4" dangerouslySetInnerHTML={{ 
                __html: type === 'question' ? 
                  `<p>${item.answer.substring(0, 100)}...</p>` : 
                  `<p>${item.content.substring(0, 100)}...</p>`
              }} />
              {type === 'note' && 'category' in item && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.category === 'method' ? 'bg-blue-100 text-blue-700' :
                  item.category === 'skill' ? 'bg-purple-100 text-purple-700' :
                  item.category === 'habit' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.category === 'method' ? '学习方式' :
                   item.category === 'skill' ? '学习技巧' :
                   item.category === 'habit' ? '学习习惯' :
                   '普通笔记'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === 'knowledge' ? 'bg-blue-100' :
              type === 'note' ? 'bg-green-100' :
              type === 'question' ? 'bg-purple-100' :
              'bg-amber-100'
            }`}>
              <Icon 
                name={
                  type === 'knowledge' ? 'book-open-check' :
                  type === 'note' ? 'sticky-note' :
                  type === 'question' ? 'help-circle' :
                  'brain'
                } 
                size={20} 
                className={
                  type === 'knowledge' ? 'text-blue-600' :
                  type === 'note' ? 'text-green-600' :
                  type === 'question' ? 'text-purple-600' :
                  'text-amber-600'
                } 
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {type === 'question' ? `${item.content.substring(0, 80)}...` : item.title}
              </h3>
              <div className="text-gray-600 text-sm mt-1">
                {type === 'question' ? 
                  `${item.answer.substring(0, 120)}...` : 
                  `${item.content.substring(0, 120)}...`}
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'knowledge' ? 'bg-blue-100 text-blue-700' :
              type === 'note' ? 'bg-green-100 text-green-700' :
              type === 'question' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {type === 'knowledge' ? '知识点' :
               type === 'note' ? '笔记' :
               type === 'question' ? '题目' :
               '必背内容'}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 搜索表单 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">搜索结果</h1>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索知识点、笔记、题目或必背内容..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Icon name="search" size={20} />
              <span>搜索</span>
            </button>
          </form>
        </div>

        {/* 结果统计和显示模式 */}
        {totalResults > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="text-gray-600">
              找到 <span className="font-semibold text-gray-900">{totalResults}</span> 个结果
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">显示模式：</span>
              <button
                onClick={() => setShowMode('card')}
                className={`p-2 rounded-lg transition-colors ${
                  showMode === 'card' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="卡片模式"
              >
                <Icon name="grid" size={20} />
              </button>
              <button
                onClick={() => setShowMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  showMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="列表模式"
              >
                <Icon name="list" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        <div className="space-y-8">
          {/* 知识点结果 */}
          {results.knowledge.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">知识点</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {results.knowledge.length}
                </span>
              </div>
              <div className={`space-y-${showMode === 'card' ? '6' : '4'}`}>
                {results.knowledge.map(item => renderResultItem(item, 'knowledge'))}
              </div>
            </div>
          )}

          {/* 笔记结果 */}
          {results.note.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">笔记</h2>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {results.note.length}
                </span>
              </div>
              <div className={`space-y-${showMode === 'card' ? '6' : '4'}`}>
                {results.note.map(item => renderResultItem(item, 'note'))}
              </div>
            </div>
          )}

          {/* 题目结果 */}
          {results.question.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">题目</h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {results.question.length}
                </span>
              </div>
              <div className={`space-y-${showMode === 'card' ? '6' : '4'}`}>
                {results.question.map(item => renderResultItem(item, 'question'))}
              </div>
            </div>
          )}

          {/* 必背内容结果 */}
          {results.memorize.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">必背内容</h2>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  {results.memorize.length}
                </span>
              </div>
              <div className={`space-y-${showMode === 'card' ? '6' : '4'}`}>
                {results.memorize.map(item => renderResultItem(item, 'memorize'))}
              </div>
            </div>
          )}

          {/* 无结果 */}
          {totalResults === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Icon name="search" size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">没有找到相关结果</h3>
              <p className="text-gray-600 mb-6">
                {query ? `没有找到与 "${query}" 相关的内容` : '请输入关键词进行搜索'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Icon name="home" size={20} />
                <span>返回首页</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
