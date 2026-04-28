import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { KnowledgePoint } from '../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function Knowledge() {
  const navigate = useNavigate();
  const { currentSubject, currentUser, knowledgePoints, addKnowledgePoint, updateKnowledgePoint, deleteKnowledgePoint } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    images: [] as string[],
  });
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [showMode, setShowMode] = useState<'card' | 'list'>('card');
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgePoint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectKnowledge = knowledgePoints.filter((kp) => kp.subjectId === currentSubject.id && kp.userId === currentUser?.id);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    subjectKnowledge.forEach(kp => kp.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [subjectKnowledge]);

  // 筛选和排序知识点
  const filteredAndSortedKnowledge = useMemo(() => {
    let filtered = subjectKnowledge;
    
    // 按标签筛选
    if (filterTag) {
      filtered = filtered.filter(kp => kp.tags.includes(filterTag));
    }
    
    // 排序
    return [...filtered].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else { // title
        return a.title.localeCompare(b.title);
      }
    });
  }, [subjectKnowledge, filterTag, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateKnowledgePoint(editingId, {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        images: formData.images,
      });
    } else {
      addKnowledgePoint({
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

  const handleEdit = (kp: KnowledgePoint) => {
    setEditingId(kp.id);
    setFormData({
      title: kp.title,
      content: kp.content,
      tags: kp.tags.join(', '),
      images: kp.images || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个知识点吗？')) {
      deleteKnowledgePoint(id);
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

  const handleKnowledgeClick = (kp: KnowledgePoint) => {
    setSelectedKnowledge(kp);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">知识归纳</h1>
            <p className="text-gray-600 mt-1">整理和管理{currentSubject.name}知识点</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 self-start sm:self-auto"
          >
            <Icon name="plus" size={20} />
            <span>添加知识点</span>
          </button>
        </div>

        {/* 筛选、排序和显示模式功能 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 按标签筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按标签筛选</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTag(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
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
                  className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'card' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon name="grid" size={16} />
                  <span>卡片</span>
                </button>
                <button
                  onClick={() => setShowMode('list')}
                  className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'list' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon name="list" size={16} />
                  <span>列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedKnowledge.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="book-open-check" size={48} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filterTag ? `没有包含标签 "${filterTag}" 的知识点` : '还没有知识点'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterTag ? '尝试选择其他标签或添加新的知识点' : '点击上方按钮添加第一个知识点'}
            </p>
          </div>
        ) : showMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedKnowledge.map((kp) => (
              <div 
                key={kp.id} 
                className={`
                  aspect-square bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 
                  transform hover:-translate-y-2 cursor-pointer
                  border-l-4 border-blue-500
                  relative overflow-hidden group
                `}
                onClick={() => handleKnowledgeClick(kp)}
              >
                <div className="flex items-start justify-between h-full flex-col">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{kp.title}</h3>
                    </div>
                    <div className="text-gray-700 mb-3 line-clamp-4" dangerouslySetInnerHTML={{ __html: kp.content }} />
                    {kp.images && kp.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        {kp.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    {kp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {kp.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterTag(tag);
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                        {kp.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            +{kp.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(kp);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(kp.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
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
            {filteredAndSortedKnowledge.map((kp) => (
              <div 
                key={kp.id} 
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer"
                onClick={() => handleKnowledgeClick(kp)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="book-open-check" size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{kp.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(kp.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm mb-3" dangerouslySetInnerHTML={{ __html: kp.content.substring(0, 150) + '...' }} />
                    <div className="flex flex-wrap items-center gap-2">
                      {kp.images && kp.images.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {kp.images.length} 张图片
                        </span>
                      )}
                      {kp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {kp.tags.map((tag, index) => (
                            <span
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterTag(tag);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(kp);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(kp.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Icon name="trash2" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? '编辑知识点' : '添加知识点'}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入知识点标题"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="输入知识点内容"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
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

        {/* 知识点详情模态框 */}
        {showDetailModal && selectedKnowledge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">知识点详情</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedKnowledge.title}</h3>
                    <p className="text-sm text-gray-500">
                      更新时间：{new Date(selectedKnowledge.updatedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedKnowledge.content }} />
                  </div>

                  {selectedKnowledge.images && selectedKnowledge.images.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">图片</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedKnowledge.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`图片 ${index + 1}`}
                              className="w-full h-auto max-h-96 object-contain rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedKnowledge.tags.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedKnowledge.tags.map((tag, index) => (
                          <span
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterTag(tag);
                              setShowDetailModal(false);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEdit(selectedKnowledge);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Icon name="edit" size={18} />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        if (confirm('确定要删除这个知识点吗？')) {
                          deleteKnowledgePoint(selectedKnowledge.id);
                        }
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Icon name="trash2" size={18} />
                      <span>删除</span>
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
