import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { StudyRecord } from '../types';

const focusLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const focusColors: Record<string, string> = {
  low: '#EF4444',
  medium: '#F59E0B',
  high: '#10B981',
};

export function Study() {
  const navigate = useNavigate();
  const { currentSubject, studyRecords, addStudyRecord, updateStudyRecord, deleteStudyRecord } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    duration: 30,
    focusLevel: 'medium' as 'low' | 'medium' | 'high',
    activities: ['阅读', '笔记'],
    notes: '',
  });
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['阅读', '笔记']);
  const [customActivity, setCustomActivity] = useState('');

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectStudyRecords = studyRecords.filter((record) => record.subjectId === currentSubject.id);
  const totalStudyTime = subjectStudyRecords.reduce((sum, record) => sum + record.duration, 0);
  const averageFocusLevel = subjectStudyRecords.length > 0 
    ? subjectStudyRecords.reduce((sum, record) => {
        const focusValue = record.focusLevel === 'low' ? 1 : record.focusLevel === 'medium' ? 2 : 3;
        return sum + focusValue;
      }, 0) / subjectStudyRecords.length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const startTime = new Date(now.getTime() - formData.duration * 60000).toISOString();
    const endTime = now.toISOString();

    if (editingId) {
      updateStudyRecord(editingId, {
        duration: formData.duration,
        focusLevel: formData.focusLevel,
        activities: selectedActivities,
        notes: formData.notes,
      });
    } else {
      addStudyRecord({
        subjectId: currentSubject.id,
        duration: formData.duration,
        startTime,
        endTime,
        focusLevel: formData.focusLevel,
        activities: selectedActivities,
        notes: formData.notes,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      duration: 30,
      focusLevel: 'medium',
      activities: ['阅读', '笔记'],
      notes: '',
    });
    setSelectedActivities(['阅读', '笔记']);
    setCustomActivity('');
  };

  const handleEdit = (record: StudyRecord) => {
    setEditingId(record.id);
    setFormData({
      duration: record.duration,
      focusLevel: record.focusLevel,
      activities: record.activities,
      notes: record.notes || '',
    });
    setSelectedActivities(record.activities);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个学习记录吗？')) {
      deleteStudyRecord(id);
    }
  };

  const handleActivityToggle = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleAddCustomActivity = () => {
    if (customActivity.trim() && !selectedActivities.includes(customActivity.trim())) {
      setSelectedActivities([...selectedActivities, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">学习记录</h1>
            <p className="text-gray-600 mt-1">记录和分析学习时间与专注度</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Icon name="plus" size={20} />
            <span>添加学习记录</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="clock" size={24} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-900">总学习时长</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{totalStudyTime} 分钟</p>
            <p className="text-sm text-gray-500 mt-2">
              约 {Math.round(totalStudyTime / 60)} 小时 {totalStudyTime % 60} 分钟
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="activity" size={24} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-900">学习次数</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{subjectStudyRecords.length} 次</p>
            <p className="text-sm text-gray-500 mt-2">
              平均每次 {subjectStudyRecords.length > 0 ? Math.round(totalStudyTime / subjectStudyRecords.length) : 0} 分钟
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="brain" size={24} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-900">平均专注度</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {averageFocusLevel > 0 ? Math.round(averageFocusLevel * 10) / 10 : 0}/3
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {averageFocusLevel >= 2.5 ? '优秀' : averageFocusLevel >= 1.5 ? '良好' : '需要提高'}
            </p>
          </div>
        </div>

        {subjectStudyRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Icon name="clock" size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有学习记录</h3>
            <p className="text-gray-600 mb-6">点击上方按钮添加第一条学习记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">学习记录列表</h2>
            <div className="space-y-4">
              {subjectStudyRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: focusColors[record.focusLevel] + '20',
                            color: focusColors[record.focusLevel],
                          }}
                        >
                          专注度: {focusLabels[record.focusLevel]}
                        </span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          {record.duration} 分钟
                        </span>
                      </div>
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1">学习活动</h3>
                        <div className="flex flex-wrap gap-2">
                          {record.activities.map((activity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>开始: {formatDate(record.startTime)}</p>
                        <p>结束: {formatDate(record.endTime)}</p>
                      </div>
                      {record.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{record.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Icon name="trash2" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? '编辑学习记录' : '添加学习记录'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({
                        duration: 30,
                        focusLevel: 'medium',
                        activities: ['阅读', '笔记'],
                        notes: '',
                      });
                      setSelectedActivities(['阅读', '笔记']);
                      setCustomActivity('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学习时长（分钟）</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">专注程度</label>
                    <select
                      value={formData.focusLevel}
                      onChange={(e) => setFormData({ ...formData, focusLevel: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学习活动</label>
                    <div className="space-y-2">
                      {['阅读', '笔记', '做题', '背诵', '复习', '讨论'].map((activity) => (
                        <label key={activity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedActivities.includes(activity)}
                            onChange={() => handleActivityToggle(activity)}
                            className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{activity}</span>
                        </label>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customActivity}
                          onChange={(e) => setCustomActivity(e.target.value)}
                          placeholder="自定义活动"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomActivity}
                          className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px]"
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
                          duration: 30,
                          focusLevel: 'medium',
                          activities: ['阅读', '笔记'],
                          notes: '',
                        });
                        setSelectedActivities(['阅读', '笔记']);
                        setCustomActivity('');
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
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
