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

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectMemorizeItems = memorizeItems.filter((item) => item.subjectId === currentSubject.id);
  const memorizedCount = subjectMemorizeItems.filter((item) => item.isMemorized).length;
  const totalCount = subjectMemorizeItems.length;
  const progress = totalCount > 0 ? (memorizedCount / totalCount) * 100 : 0;

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
      // 简单的填空生成逻辑：将内容按句子分割，随机选择部分作为填空
      const content = item.content.replace(/<[^>]*>/g, ''); // 移除HTML标签
      const sentences = content.split(/[。！？.!?]/).filter(s => s.trim());
      const blanks: string[] = [];
      const answers: string[] = [];
      
      sentences.forEach((sentence, index) => {
        if (index % 2 === 0 && sentence.length > 5) {
          // 将句子的中间部分作为填空
          const mid = Math.floor(sentence.length / 2);
          const blankStart = Math.max(0, mid - 2);
          const blankEnd = Math.min(sentence.length, mid + 2);
          const answer = sentence.substring(blankStart, blankEnd);
          const blankSentence = sentence.substring(0, blankStart) + '_____' + sentence.substring(blankEnd);
          blanks.push(blankSentence);
          answers.push(answer);
        } else {
          blanks.push(sentence);
          answers.push('');
        }
      });
      
      setFillBlanks(blanks);
      setFillAnswers(new Array(blanks.length).fill(''));
    }
    
    setIsTesting(true);
  };

  const handleSubmitTest = () => {
    if (testItem) {
      if (testMode === 'fill') {
        // 填空模式评分
        const content = testItem.content.replace(/<[^>]*>/g, '');
        const sentences = content.split(/[。！？.!?]/).filter(s => s.trim());
        let correctCount = 0;
        let totalBlanks = 0;
        
        sentences.forEach((sentence, index) => {
          if (index % 2 === 0 && sentence.length > 5) {
            totalBlanks++;
            const mid = Math.floor(sentence.length / 2);
            const blankStart = Math.max(0, mid - 2);
            const blankEnd = Math.min(sentence.length, mid + 2);
            const correctAnswer = sentence.substring(blankStart, blankEnd);
            const userAnswer = fillAnswers[index] || '';
            
            if (userAnswer.toLowerCase().includes(correctAnswer.toLowerCase())) {
              correctCount++;
            }
          }
        });
        
        const similarity = totalBlanks > 0 ? correctCount / totalBlanks : 0;
        const correct = similarity >= 0.8;
        setTestResult({ correct, similarity });
      } else {
        // 文字和语音模式评分
        const userAnswer = testAnswer;
        const originalAnswer = testItem.content;
        
        // 简单的相似度计算：计算匹配的字符数
        const userChars = userAnswer.toLowerCase().replace(/\s/g, '');
        const originalChars = originalAnswer.toLowerCase().replace(/\s/g, '');
        
        let matchCount = 0;
        for (let i = 0; i < Math.min(userChars.length, originalChars.length); i++) {
          if (userChars[i] === originalChars[i]) {
            matchCount++;
          }
        }
        
        // 相似度达到80%以上认为正确
        const similarity = originalChars.length > 0 ? matchCount / originalChars.length : 0;
        const correct = similarity >= 0.8;
        
        setTestResult({ correct, similarity });
      }
    }
  };

  const handleVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTestAnswer(transcript);
      };
      recognition.start();
    } else {
      alert('您的浏览器不支持语音识别功能');
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

            <div className="grid gap-4">
              {subjectMemorizeItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow ${item.isMemorized ? 'border-l-4 border-purple-500' : ''}`}>
                  <div className="flex items-start justify-between">
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
                        <h3 className={`text-xl font-semibold ${
                          item.isMemorized ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                      </div>
                      <div className={`text-gray-700 mb-4 ${
                        item.isMemorized ? 'line-through' : ''
                      }`} dangerouslySetInnerHTML={{ __html: item.content }} />
                      {item.images && item.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {item.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`图片 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleStartTest(item)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="测试记忆"
                      >
                        <Icon name="check-circle2" size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Icon name="edit" size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Icon name="trash2" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                      setFormData({ title: '', content: '', tags: '' });
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
                        setFormData({ title: '', content: '', tags: '' });
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
