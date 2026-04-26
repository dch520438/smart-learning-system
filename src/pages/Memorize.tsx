import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { MemorizeItem } from '../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function Memorize() {
  const navigate = useNavigate();
  const { currentSubject, memorizeItems, addMemorizeItem, updateMemorizeItem, deleteMemorizeItem, toggleMemorizeStatus } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    images: [] as string[],
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testItem, setTestItem] = useState<MemorizeItem | null>(null);
  const [testAnswer, setTestAnswer] = useState('');
  const [testResult, setTestResult] = useState<{ correct: boolean; similarity: number } | null>(null);
  const [testMode, setTestMode] = useState<'text' | 'voice' | 'fill'>('text');
  const [fillBlanks, setFillBlanks] = useState<string[]>([]);
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'memorized' | 'not-memorized'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [showMode, setShowMode] = useState<'card' | 'list'>('card');

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectMemorizeItems = memorizeItems.filter((item) => item.subjectId === currentSubject.id);
  const memorizedCount = subjectMemorizeItems.filter((item) => item.isMemorized).length;
  const totalCount = subjectMemorizeItems.length;
  const progress = totalCount > 0 ? (memorizedCount / totalCount) * 100 : 0;

  // 获取所有标签
  const allTags = Array.from(new Set(subjectMemorizeItems.flatMap(item => item.tags)));

  // 筛选和排序必背内容
  const filteredAndSortedItems = subjectMemorizeItems
    .filter(item => {
      // 按状态筛选
      if (filterStatus === 'memorized' && !item.isMemorized) return false;
      if (filterStatus === 'not-memorized' && item.isMemorized) return false;
      // 按标签筛选
      if (filterTag && !item.tags.includes(filterTag)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else { // title
        return a.title.localeCompare(b.title);
      }
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateMemorizeItem(editingId, {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        images: formData.images,
      });
    } else {
      addMemorizeItem({
        subjectId: currentSubject.id,
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        images: formData.images,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', tags: '', images: [] });
  };

  const handleEdit = (item: MemorizeItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      tags: item.tags.join(', '),
      images: item.images || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个必背内容吗？')) {
      deleteMemorizeItem(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // 这里使用 base64 编码来处理图片，实际项目中可能需要上传到服务器
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            images: [...formData.images, event.target.result as string],
          });
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleStartTest = (item: MemorizeItem) => {
    setTestItem(item);
    setTestAnswer('');
    setTestResult(null);
    
    // 为填空模式准备数据
    if (testMode === 'fill') {
      const content = item.content.replace(/<[^>]*>/g, ''); // 移除HTML标签
      const blanks: string[] = [];
      const correctAnswers: string[] = [];
      
      // 按标点符号分割句子，但保留标点符号
      const punctuationRegex = /([。！？.!?，；,;])/g;
      const parts = content.split(punctuationRegex);
      
      parts.forEach((part, index) => {
        if (!punctuationRegex.test(part) && part.trim().length > 3) {
          const sentence = part.trim();
          
          // 中文分词（简单实现，按常用词分割）
          const commonWords = [
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
            '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有',
            '看', '好', '自己', '这', '那', '我们', '他们', '什么', '怎么', '为什么',
            '因为', '所以', '但是', '如果', '或者', '虽然', '然后', '还是', '只是',
            '已经', '正在', '还是', '不是', '而是', '就是', '只有', '只要', '除非'
          ];
          
          let processed = sentence;
          const foundWords: Array<{ word: string; index: number }> = [];
          
          // 找出句子中的常用词
          commonWords.forEach(word => {
            const regex = new RegExp(word, 'g');
            let match;
            while ((match = regex.exec(sentence)) !== null) {
              foundWords.push({ word, index: match.index });
            }
          });
          
          if (foundWords.length > 0) {
            // 随机选择一个词作为填空
            const randomIndex = Math.floor(Math.random() * foundWords.length);
            const selectedWord = foundWords[randomIndex].word;
            const selectedIndex = foundWords[randomIndex].index;
            
            // 构建填空句子
            const before = sentence.substring(0, selectedIndex);
            const after = sentence.substring(selectedIndex + selectedWord.length);
            blanks.push(before + '_____' + after);
            correctAnswers.push(selectedWord);
          } else {
            blanks.push(sentence);
            correctAnswers.push('');
          }
        } else {
          blanks.push(part);
          correctAnswers.push('');
        }
      });
      
      setFillBlanks(blanks);
      setFillAnswers(new Array(blanks.length).fill(''));
      // 保存正确答案用于后续评分
      (window as any).currentCorrectAnswers = correctAnswers;
    }
    
    setIsTesting(true);
  };

  const handleSubmitTest = () => {
    if (testItem) {
      if (testMode === 'fill') {
        // 填空模式评分
        const correctAnswers = (window as any).currentCorrectAnswers || [];
        let correctCount = 0;
        let totalBlanks = 0;
        
        fillBlanks.forEach((blank, index) => {
          if (blank.includes('_____')) {
            totalBlanks++;
            const correctAnswer = correctAnswers[index] || '';
            const userAnswer = fillAnswers[index] || '';
            
            if (correctAnswer && userAnswer.trim()) {
              // 使用更准确的匹配算法
              const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
              const normalizedCorrect = normalize(correctAnswer);
              const normalizedUser = normalize(userAnswer);
              
              if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
                correctCount++;
              } else {
                // 计算字符串相似度
                const similarity = calculateSimilarity(normalizedCorrect, normalizedUser);
                if (similarity >= 0.6) {
                  correctCount++;
                }
              }
            }
          }
        });
        
        const similarity = totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) / 100 : 0;
        const correct = similarity >= 0.7;
        setTestResult({ correct, similarity });
      } else {
        // 文字和语音模式评分
        const userAnswer = testAnswer;
        const originalAnswer = testItem.content;
        
        // 计算文本相似度
        const similarity = calculateSimilarity(userAnswer, originalAnswer);
        const correct = similarity >= 0.7;
        
        setTestResult({ correct, similarity });
      }
    }
  };
  
  // 辅助函数：计算两个字符串的相似度
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1.length === 0 || s2.length === 0) return 0;
    
    // 使用Levenshtein距离计算相似度
    const matrix: number[][] = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [];
      for (let j = 0; j <= s1.length; j++) {
        if (i === 0) matrix[i][j] = j;
        else if (j === 0) matrix[i][j] = i;
        else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + (s1[j - 1] === s2[i - 1] ? 0 : 1)
          );
        }
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLength);
  };

  const handleVoiceRecognition = () => {
    try {
      // 检查浏览器支持
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTestAnswer(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('语音识别错误:', event.error);
          alert(`语音识别错误: ${event.error}，请确保您的浏览器支持语音识别功能，并已授予麦克风权限`);
        };
        
        recognition.onend = () => {
          console.log('语音识别结束');
        };
        
        recognition.start();
      } else {
        alert('您的浏览器不支持语音识别功能，请尝试使用Chrome浏览器');
      }
    } catch (error) {
      console.error('语音识别启动失败:', error);
      alert('语音识别启动失败，请确保您的浏览器支持语音识别功能');
    }
  };

  const handleEndTest = () => {
    setIsTesting(false);
    setTestItem(null);
    setTestAnswer('');
    setTestResult(null);
    setFillBlanks([]);
    setFillAnswers([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">必背必记</h1>
            <p className="text-gray-600 mt-1">重点内容记忆和背诵</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Icon name="plus" size={20} />
            <span>添加必背内容</span>
          </button>
        </div>

        {subjectMemorizeItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="brain" size={48} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有必背内容</h3>
            <p className="text-gray-600 mb-6">点击上方按钮添加第一个必背内容</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">记忆进度</span>
                <span className="text-sm font-medium text-gray-700">{memorizedCount}/{totalCount} 已记忆</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* 筛选、排序和显示模式功能 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 按状态筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">按状态筛选</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      全部
                    </button>
                    <button
                      onClick={() => setFilterStatus('memorized')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === 'memorized' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      已记忆
                    </button>
                    <button
                      onClick={() => setFilterStatus('not-memorized')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === 'not-memorized' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      未记忆
                    </button>
                  </div>
                </div>

                {/* 按标签筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">按标签筛选</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterTag(null)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === null ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      全部
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === tag ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 排序方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'title')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                  >
                    <option value="latest">最新修改</option>
                    <option value="oldest">最早创建</option>
                    <option value="title">按标题排序</option>
                  </select>
                </div>

                {/* 显示模式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">显示模式</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowMode('card')}
                      className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'card' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon name="grid" size={16} />
                      <span>卡片</span>
                    </button>
                    <button
                      onClick={() => setShowMode('list')}
                      className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'list' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon name="list" size={16} />
                      <span>列表</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Icon name="brain" size={48} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">没有符合条件的必背内容</h3>
                <p className="text-gray-600 mb-6">尝试调整筛选条件或添加新的必背内容</p>
              </div>
            ) : showMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`
                      aspect-square bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 
                      transform hover:-translate-y-1
                      ${item.isMemorized ? 'border-l-4 border-purple-500' : ''}
                      relative overflow-hidden
                    `}
                    style={{
                      // 添加堆叠效果的阴影层次
                      zIndex: index,
                      marginTop: index > 0 ? '-4px' : '0',
                    }}
                  >
                    <div className="flex items-start justify-between h-full flex-col">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <button
                            onClick={() => toggleMemorizeStatus(item.id)}
                            className={`p-2 rounded-full transition-colors ${
                              item.isMemorized
                                ? 'bg-green-100 text-green-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Icon name={item.isMemorized ? 'check-circle2' : 'circle'} size={20} />
                          </button>
                          <h3 className={`text-lg font-semibold ${
                            item.isMemorized ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                        </div>
                        <div className={`text-gray-700 mb-4 line-clamp-4 ${
                          item.isMemorized ? 'line-through' : ''
                        }`} dangerouslySetInnerHTML={{ __html: item.content }} />
                        {item.images && item.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {item.images.slice(0, 4).map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`图片 ${index + 1}`}
                                className="w-full h-16 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                onClick={() => setFilterTag(tag)}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs cursor-pointer hover:bg-purple-200 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleStartTest(item)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="测试记忆"
                        >
                          <Icon name="check-circle2" size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icon name="trash2" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => (
                  <div key={item.id} className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-purple-200 ${item.isMemorized ? 'border-l-4 border-purple-500' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleMemorizeStatus(item.id)}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                          item.isMemorized
                            ? 'bg-green-100 text-green-500'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Icon name={item.isMemorized ? 'check-circle2' : 'circle'} size={20} />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-semibold ${
                            item.isMemorized ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <div className={`text-gray-700 text-sm mb-3 ${
                          item.isMemorized ? 'line-through' : ''
                        }`} dangerouslySetInnerHTML={{ __html: item.content.substring(0, 150) + '...' }} />
                        <div className="flex flex-wrap items-center gap-2">
                          {item.images && item.images.length > 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {item.images.length} 张图片
                            </span>
                          )}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  onClick={() => setFilterTag(tag)}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-pointer hover:bg-purple-200 transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2 ml-4 pt-2">
                        <button
                          onClick={() => handleStartTest(item)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="测试记忆"
                        >
                          <Icon name="check-circle2" size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icon name="trash2" size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? '编辑必背内容' : '添加必背内容'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({ title: '', content: '', tags: '', images: [] });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="输入必背内容标题"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="输入必背内容"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'font': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image', 'video']
                          ]
                        }}
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">图片</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="px-4 py-2 border border-gray-300 rounded-xl"
                      />
                      <span className="text-sm text-gray-500">支持 JPG、PNG、GIF 等格式</span>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`上传图片 ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <Icon name="x" size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="标签1, 标签2, 标签3"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({ title: '', content: '', tags: '', images: [] });
                    }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Icon name="save" size={20} />
                      <span>保存</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isTesting && testItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">测试记忆</h2>
                  <button
                    onClick={handleEndTest}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{testItem.title}</h3>
                    <p className="text-gray-600 mb-4">请默写或背诵上面的内容</p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="testMode"
                        value="text"
                        checked={testMode === 'text'}
                        onChange={() => setTestMode('text')}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">文字输入</span>
                    </label>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="testMode"
                        value="voice"
                        checked={testMode === 'voice'}
                        onChange={() => setTestMode('voice')}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">语音输入</span>
                    </label>
                    <label className="flex items-center space-x-2 mb-4">
                      <input
                        type="radio"
                        name="testMode"
                        value="fill"
                        checked={testMode === 'fill'}
                        onChange={() => setTestMode('fill')}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">填空</span>
                    </label>

                    {testMode === 'text' ? (
                      <textarea
                        value={testAnswer}
                        onChange={(e) => setTestAnswer(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[200px]"
                        placeholder="请在此处输入答案"
                      />
                    ) : testMode === 'voice' ? (
                      <div className="border border-gray-300 rounded-xl p-4 text-center">
                        <button
                          onClick={handleVoiceRecognition}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
                        >
                          <Icon name="mic" size={20} />
                          <span>开始语音输入</span>
                        </button>
                        <p className="mt-4 text-sm text-gray-500">点击按钮后开始说话，系统会自动识别您的语音</p>
                        {testAnswer && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">识别结果：{testAnswer}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-xl p-4">
                        <p className="text-sm text-gray-700 mb-4">请填写下面的空白处：</p>
                        <div className="space-y-4">
                          {fillBlanks.map((blank, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-gray-700 flex-1">{blank}</span>
                              {blank.includes('_____') && (
                                <input
                                  type="text"
                                  value={fillAnswers[index] || ''}
                                  onChange={(e) => {
                                    const newAnswers = [...fillAnswers];
                                    newAnswers[index] = e.target.value;
                                    setFillAnswers(newAnswers);
                                  }}
                                  className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="请输入"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {testResult && (
                    <div className={`p-4 rounded-xl ${testResult.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <h4 className={`font-semibold mb-2 ${testResult.correct ? 'text-green-800' : 'text-red-800'}`}>
                        {testResult.correct ? '测试通过！' : '测试未通过'}
                      </h4>
                      <p className="text-gray-700">相似度：{Math.round(testResult.similarity * 100)}%</p>
                      {!testResult.correct && (
                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">正确答案：</h5>
                          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: testItem.content }} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleEndTest}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitTest}
                      className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Icon name="check" size={20} />
                      <span>提交答案</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
