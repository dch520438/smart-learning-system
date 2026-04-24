import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Paper } from '../types';

export function Papers() {
  const navigate = useNavigate();
  const { currentSubject, papers, addPaper, updatePaper, deletePaper } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    subjectId: '',
    images: [] as string[],
    notes: '',
  });

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectPapers = papers.filter((paper) => paper.subjectId === currentSubject.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updatePaper(editingId, {
        title: formData.title,
        date: formData.date,
        images: formData.images,
        notes: formData.notes,
      });
    } else {
      addPaper({
        subjectId: currentSubject.id,
        title: formData.title,
        date: formData.date,
        images: formData.images,
        notes: formData.notes,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      subjectId: '',
      images: [],
      notes: '',
    });
  };

  const handleEdit = (paper: Paper) => {
    setEditingId(paper.id);
    setFormData({
      title: paper.title,
      date: paper.date,
      subjectId: paper.subjectId,
      images: paper.images || [],
      notes: paper.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这份试卷吗？')) {
      deletePaper(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
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

  const handleTakePhoto = () => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          // 创建一个临时的拍照界面
          const photoModal = document.createElement('div');
          photoModal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
          photoModal.innerHTML = `
            <div className="bg-white rounded-2xl p-4 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">拍照</h3>
                <button id="close-photo" className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <video id="photo-video" width="100%" height="300" autoPlay></video>
              </div>
              <button id="take-photo" className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                拍照
              </button>
            </div>
          `;
          document.body.appendChild(photoModal);

          const videoElement = document.getElementById('photo-video') as HTMLVideoElement;
          videoElement.srcObject = stream;

          document.getElementById('close-photo')?.addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(photoModal);
          });

          document.getElementById('take-photo')?.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageDataUrl = canvas.toDataURL('image/jpeg');
              setFormData({
                ...formData,
                images: [...formData.images, imageDataUrl],
              });
            }
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(photoModal);
          });
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          alert('无法访问摄像头，请检查设备权限');
        });
    } else {
      alert('您的浏览器不支持摄像头功能');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">试卷收集</h1>
            <p className="text-gray-600 mt-1">收集和管理学校做过的试卷</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Icon name="plus" size={20} />
            <span>添加试卷</span>
          </button>
        </div>

        {subjectPapers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="file" size={48} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有试卷</h3>
            <p className="text-gray-600 mb-6">点击上方按钮添加第一份试卷</p>
          </div>
        ) : (
          <div className="space-y-6">
            {subjectPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{paper.title}</h3>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {paper.date}
                      </span>
                    </div>
                    
                    {paper.images && paper.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {paper.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`试卷图片 ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {paper.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{paper.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(paper)}
                      className="p-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(paper.id)}
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? '编辑试卷' : '添加试卷'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        subjectId: '',
                        images: [],
                        notes: '',
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">试卷名称</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="输入试卷名称"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">试卷照片</label>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={handleTakePhoto}
                          className="px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="camera" size={20} />
                          <span>拍照</span>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      </div>
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`上传图片 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                      placeholder="添加备注"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                        setFormData({
                          title: '',
                          date: new Date().toISOString().split('T')[0],
                          subjectId: '',
                          images: [],
                          notes: '',
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
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
