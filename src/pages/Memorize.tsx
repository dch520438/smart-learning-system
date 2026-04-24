import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { MemorizeItem } from '../types';

export function Memorize() {
  const navigate = useNavigate();
  const { currentSubject, memorizeItems, addMemorizeItem, updateMemorizeItem, deleteMemorizeItem, toggleMemorizeStatus } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

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
      });
    } else {
      addMemorizeItem({
        subjectId: currentSubject.id,
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', tags: '' });
  };

  const handleEdit = (item: MemorizeItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      tags: item.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个必背内容吗？')) {
      deleteMemorizeItem(id);
    }
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
                      <p className={`text-gray-700 whitespace-pre-wrap mb-4 ${
                        item.isMemorized ? 'line-through' : ''
                      }`}>
                        {item.content}
                      </p>
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
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[200px]"
                      placeholder="输入必背内容"
                      required
                    />
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
      </div>
    </div>
  );
}
