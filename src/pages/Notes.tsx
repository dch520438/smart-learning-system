import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Note } from '../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function Notes() {
  const navigate = useNavigate();
  const { currentSubject, notes, addNote, updateNote, deleteNote } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    images: [] as string[],
    category: 'note' as 'note' | 'method' | 'skill' | 'habit',
  });
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [showMode, setShowMode] = useState<'card' | 'list'>('card');

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectNotes = notes.filter((n) => n.subjectId === currentSubject.id);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    subjectNotes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [subjectNotes]);

  // 筛选和排序笔记
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = subjectNotes;
    
    // 按分类筛选
    if (filterCategory) {
      filtered = filtered.filter(note => note.category === filterCategory);
    }
    
    // 按标签筛选
    if (filterTag) {
      filtered = filtered.filter(note => note.tags.includes(filterTag));
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
  }, [subjectNotes, filterCategory, filterTag, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateNote(editingId, {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        images: formData.images,
        category: formData.category,
      });
    } else {
      addNote({
        subjectId: currentSubject.id,
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        images: formData.images,
        category: formData.category,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', tags: '', images: [], category: 'note' });
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      images: note.images || [],
      category: note.category || 'note',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个笔记吗？')) {
      deleteNote(id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">学习笔记</h1>
            <p className="text-gray-600 mt-1">记录{currentSubject.name}学习心得</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 self-start sm:self-auto"
          >
            <Icon name="plus" size={20} />
            <span>添加笔记</span>
          </button>
        </div>

        {/* 筛选、排序和显示模式功能 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 按分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按分类筛选</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === null ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterCategory('note')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'note' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  普通笔记
                </button>
                <button
                  onClick={() => setFilterCategory('method')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'method' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  学习方式
                </button>
                <button
                  onClick={() => setFilterCategory('skill')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'skill' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  学习技巧
                </button>
                <button
                  onClick={() => setFilterCategory('habit')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'habit' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  学习习惯
                </button>
              </div>
            </div>

            {/* 按标签筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按标签筛选</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTag(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === null ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTag === tag ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
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
                  className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'card' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon name="grid" size={16} />
                  <span>卡片</span>
                </button>
                <button
                  onClick={() => setShowMode('list')}
                  className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${showMode === 'list' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon name="list" size={16} />
                  <span>列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="sticky-note" size={48} className="text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filterCategory || filterTag ? '没有符合条件的笔记' : '还没有笔记'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterCategory || filterTag ? '尝试调整筛选条件或添加新的笔记' : '点击上方按钮添加第一个笔记'}
            </p>
          </div>
        ) : showMode === 'card' ? (
          <div className="grid gap-6">
            {filteredAndSortedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        note.category === 'method' ? 'bg-blue-100' :
                        note.category === 'skill' ? 'bg-purple-100' :
                        note.category === 'habit' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}>
                        <Icon 
                          name={
                            note.category === 'method' ? 'book' :
                            note.category === 'skill' ? 'lightbulb' :
                            note.category === 'habit' ? 'clock' :
                            'sticky-note'
                          } 
                          size={18} 
                          className={
                            note.category === 'method' ? 'text-blue-600' :
                            note.category === 'skill' ? 'text-purple-600' :
                            note.category === 'habit' ? 'text-amber-600' :
                            'text-gray-600'
                          } 
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">{note.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-gray-700 mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
                    {note.images && note.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {note.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`图片 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Icon name="zoom-in" size={20} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            onClick={() => setFilterTag(tag)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-2 ml-0 md:ml-4 pt-2 md:pt-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      note.category === 'method' ? 'bg-blue-100 text-blue-700' :
                      note.category === 'skill' ? 'bg-purple-100 text-purple-700' :
                      note.category === 'habit' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {note.category === 'method' ? '学习方式' :
                       note.category === 'skill' ? '学习技巧' :
                       note.category === 'habit' ? '学习习惯' :
                       '普通笔记'}
                    </span>
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Icon name="edit" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Icon name="trash2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    note.category === 'method' ? 'bg-blue-100' :
                    note.category === 'skill' ? 'bg-purple-100' :
                    note.category === 'habit' ? 'bg-amber-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon 
                      name={
                        note.category === 'method' ? 'book' :
                        note.category === 'skill' ? 'lightbulb' :
                        note.category === 'habit' ? 'clock' :
                        'sticky-note'
                      } 
                      size={24} 
                      className={
                        note.category === 'method' ? 'text-blue-600' :
                        note.category === 'skill' ? 'text-purple-600' :
                        note.category === 'habit' ? 'text-amber-600' :
                        'text-gray-600'
                      } 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.category === 'method' ? 'bg-blue-100 text-blue-700' :
                          note.category === 'skill' ? 'bg-purple-100 text-purple-700' :
                          note.category === 'habit' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {note.category === 'method' ? '学习方式' :
                           note.category === 'skill' ? '学习技巧' :
                           note.category === 'habit' ? '学习习惯' :
                           '普通笔记'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm mb-3" dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }} />
                    <div className="flex flex-wrap items-center gap-2">
                      {note.images && note.images.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {note.images.length} 张图片
                        </span>
                      )}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag, index) => (
                            <span
                              key={index}
                              onClick={() => setFilterTag(tag)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
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
                      onClick={() => handleEdit(note)}
                      className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
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
                    {editingId ? '编辑笔记' : '添加笔记'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({ title: '', content: '', tags: '', images: [], category: 'note' });
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="输入笔记标题"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="输入笔记内容"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="note">普通笔记</option>
                      <option value="method">学习方式</option>
                      <option value="skill">学习技巧</option>
                      <option value="habit">学习习惯</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="标签1, 标签2, 标签3"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({ title: '', content: '', tags: '', images: [], category: 'note' });
                    }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
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
