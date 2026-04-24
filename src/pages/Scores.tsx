import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { TestRecord } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export function Scores() {
  const navigate = useNavigate();
  const { currentSubject, testRecords, subjects } = useAppStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectTestRecords = testRecords.filter((record) => record.subjectId === currentSubject.id);
  
  // 按时间排序
  const sortedRecords = [...subjectTestRecords].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 准备图表数据
  const chartData = sortedRecords.map((record) => ({
    date: new Date(record.createdAt).toLocaleDateString('zh-CN'),
    score: record.score,
    totalScore: record.totalScore,
    accuracy: (record.score / record.totalScore) * 100,
  }));

  // 按时间范围筛选
  const filteredRecords = sortedRecords.filter((record) => {
    const recordDate = new Date(record.createdAt);
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }
    if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return recordDate >= monthAgo;
    }
    return true;
  });

  // 计算统计数据
  const totalTests = subjectTestRecords.length;
  const averageScore = totalTests > 0 
    ? subjectTestRecords.reduce((sum, record) => sum + record.score, 0) / totalTests 
    : 0;
  const averageAccuracy = totalTests > 0
    ? subjectTestRecords.reduce((sum, record) => sum + (record.score / record.totalScore) * 100, 0) / totalTests
    : 0;
  const highestScore = totalTests > 0
    ? Math.max(...subjectTestRecords.map((record) => record.score))
    : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">分数历史</h1>
            <p className="text-gray-600 mt-1">查看成绩变化和趋势</p>
          </div>
          <div className="flex items-center space-x-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range === 'week' ? '近一周' : range === 'month' ? '近一月' : '全部'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icon name="trending-up" size={24} className="text-indigo-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalTests}</div>
            <div className="text-sm text-gray-600">总测试次数</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icon name="target" size={24} className="text-indigo-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">平均分数</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icon name="check-circle2" size={24} className="text-indigo-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{averageAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">平均正确率</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">分数趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="得分"
                  stroke="#6366F1"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="totalScore"
                  name="总分"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">测试记录</h2>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Icon name="file-text" size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有测试记录</h3>
              <p className="text-gray-600 mb-6">完成测试后，这里会显示测试记录</p>
              <button
                onClick={() => navigate('/test')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <Icon name="play" size={20} />
                <span>开始测试</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{record.title}</h3>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Icon name="calendar" size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{formatDate(record.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="clock" size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{formatTimeSpent(record.timeSpent)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {record.score}/{record.totalScore}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((record.score / record.totalScore) * 100).toFixed(0)}% 正确率
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
