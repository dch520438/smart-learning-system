import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Question } from '../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const difficultyColors: Record<string, string> = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export function Patterns() {
  const navigate = useNavigate();
  const { currentSubject, questions, addQuestion, updateQuestion, deleteQuestion } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    answer: '',
    analysis: '',
    difficulty: 'medium' as const,
    knowledgePoints: '',
    type: 'single' as const,
    source: '',
    images: [] as string[],
  });

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectPatterns = questions.filter((q) => q.subjectId === currentSubject.id && q.isPattern);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kpArray = formData.knowledgePoints.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateQuestion(editingId, {
        content: formData.content,
        answer: formData.answer,
        analysis: formData.analysis,
        difficulty: formData.difficulty,
        knowledgePoints: kpArray,
        type: formData.type,
        source: formData.source,
        images: formData.images,
      });
    } else {
      addQuestion({
        subjectId: currentSubject.id,
        content: formData.content,
        answer: formData.answer,
        analysis: formData.analysis,
        difficulty: formData.difficulty,
        knowledgePoints: kpArray,
        type: formData.type,
        images: formData.images,
        source: formData.source,
        isMistake: false,
        isPattern: true,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      content: '',
      answer: '',
      analysis: '',
      difficulty: 'medium',
      knowledgePoints: '',
      type: 'single',
      source: '',
      images: [],
    });
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      content: question.content,
      answer: question.answer,
      analysis: question.analysis,
      difficulty: question.difficulty as 'medium',
      knowledgePoints: question.knowledgePoints.join(', '),
      type: question.type as 'single',
      source: question.source,
      images: question.images || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个母题吗？')) {
      deleteQuestion(id);
    }
  };

  const togglePattern = (question: Question) => {
    updateQuestion(question.id, { isPattern: !question.isPattern });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">母题整理</h1>
            <p className="text-gray-600 mt-1">经典题型和解题方法整理</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Icon name="plus" size={20} />
            <span>添加母题</span>
          </button>
        </div>

        {subjectPatterns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="star" size={48} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有母题</h3>
            <p className="text-gray-600 mb-6">点击上方按钮添加第一个母题</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {subjectPatterns.map((question) => (
              <div key={question.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-amber-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: difficultyColors[question.difficulty] + '20',
                          color: difficultyColors[question.difficulty],
                        }}
                      >
                        {difficultyLabels[question.difficulty]}
                      </span>
                      {question.knowledgePoints.length > 0 &&
                        question.knowledgePoints.map((kp, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {kp}
                          </span>
                        ))}
                    </div>
                    <div className="text-gray-900 mb-4" dangerouslySetInnerHTML={{ __html: question.content }} />
                    {question.images && question.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {question.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    {question.answer && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-green-800 mb-2">答案</h4>
                        <div className="text-green-700" dangerouslySetInnerHTML={{ __html: question.answer }} />
                      </div>
                    )}
                    {question.analysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">解析</h4>
                        <div className="text-blue-700" dangerouslySetInnerHTML={{ __html: question.analysis }} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-x-2 ml-4">
                    <button
                      onClick={() => togglePattern(question)}
                      className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="标记为非母题"
                    >
                      <Icon name="star" size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Icon name="edit" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Icon name="trash2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? '编辑母题' : '添加母题'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({
                        content: '',
                        answer: '',
                        analysis: '',
                        difficulty: 'medium',
                        knowledgePoints: '',
                        type: 'single',
                        source: '',
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">题目内容</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="输入题目内容"
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
                        className="min-h-[150px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">答案</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.answer}
                        onChange={(answer) => setFormData({ ...formData, answer })}
                        placeholder="输入答案"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['clean'],
                            ['link', 'image']
                          ]
                        }}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">解析</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.analysis}
                        onChange={(analysis) => setFormData({ ...formData, analysis })}
                        placeholder="输入题目解析"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['clean'],
                            ['link', 'image']
                          ]
                        }}
                        className="min-h-[100px]"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">来源</label>
                      <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="题目来源"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">知识点（用逗号分隔）</label>
                    <input
                      type="text"
                      value={formData.knowledgePoints}
                      onChange={(e) => setFormData({ ...formData, knowledgePoints: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="知识点1, 知识点2"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                        setFormData({
                          content: '',
                          answer: '',
                          analysis: '',
                          difficulty: 'medium',
                          knowledgePoints: '',
                          type: 'single',
                          source: '',
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2"
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
      </div>
    </div>
  );
}
