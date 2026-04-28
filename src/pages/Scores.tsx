import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function Scores() {
  const navigate = useNavigate();
  const { currentSubject, testRecords, addTestRecord, updateTestRecord, deleteTestRecord, knowledgeItems, memorizeItems, mistakeItems, patternItems } = useAppStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    score: '',
    totalScore: '',
    timeSpent: '',
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    knowledge: false,
    memorize: false,
    mistakes: false,
    patterns: false,
    analysis: false,
    mindmap: false,
  });

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
    if (timeRange === 'custom') {
      if (!customDateRange.start || !customDateRange.end) {
        return false;
      }
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999);
      return recordDate >= startDate && recordDate <= endDate;
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


  const formatDate = (date: Date | string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingRecordId) {
      updateTestRecord(editingRecordId, {
        title: formData.title,
        score: parseFloat(formData.score) || 0,
        totalScore: parseFloat(formData.totalScore) || 100,
        timeSpent: parseFloat(formData.timeSpent) * 60 || 600,
      });
    } else {
      addTestRecord({
        subjectId: currentSubject.id,
        title: formData.title,
        score: parseFloat(formData.score) || 0,
        totalScore: parseFloat(formData.totalScore) || 100,
        questions: [],
        answers: {},
        timeSpent: parseFloat(formData.timeSpent) * 60 || 600,
      });
    }
    
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingRecordId(null);
    setFormData({
      title: '',
      score: '',
      totalScore: '',
      timeSpent: '',
    });
  };

  const handleEdit = (record: typeof testRecords[0]) => {
    setIsEditMode(true);
    setEditingRecordId(record.id);
    setFormData({
      title: record.title,
      score: record.score.toString(),
      totalScore: record.totalScore.toString(),
      timeSpent: (record.timeSpent / 60).toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (recordId: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteTestRecord(recordId);
    }
  };

  const handlePrint = () => {
    let printContent = `<html><head><title>学习资料打印</title><style>
      body { font-family: 'Microsoft YaHei', sans-serif; margin: 20px; }
      h1 { text-align: center; color: #333; border-bottom: 2px solid #6366F1; padding-bottom: 10px; }
      h2 { color: #6366F1; margin-top: 30px; }
      .section { margin-bottom: 30px; }
      .item { border-bottom: 1px dashed #ccc; padding: 10px 0; }
      .item-title { font-weight: bold; color: #333; }
      .item-content { color: #666; margin-top: 5px; }
    </style></head><body>`;
    
    printContent += `<h1>${currentSubject?.name} - 学习资料</h1>`;
    
    if (printOptions.knowledge) {
      const items = knowledgeItems.filter(item => item.subjectId === currentSubject?.id);
      printContent += `<div class="section"><h2>知识点 (${items.length})</h2>`;
      items.forEach(item => {
        printContent += `<div class="item"><div class="item-title">${item.title}</div><div class="item-content">${item.content}</div></div>`;
      });
      printContent += `</div>`;
    }
    
    if (printOptions.memorize) {
      const items = memorizeItems.filter(item => item.subjectId === currentSubject?.id);
      printContent += `<div class="section"><h2>必记必背 (${items.length})</h2>`;
      items.forEach(item => {
        printContent += `<div class="item"><div class="item-title">${item.title}</div><div class="item-content">${item.content}</div></div>`;
      });
      printContent += `</div>`;
    }
    
    if (printOptions.mistakes) {
      const items = mistakeItems.filter(item => item.subjectId === currentSubject?.id);
      printContent += `<div class="section"><h2>错题整理 (${items.length})</h2>`;
      items.forEach(item => {
        printContent += `<div class="item"><div class="item-title">${item.question}</div><div class="item-content">正确答案: ${item.correctAnswer}</div><div class="item-content">解析: ${item.analysis}</div></div>`;
      });
      printContent += `</div>`;
    }
    
    if (printOptions.patterns) {
      const items = patternItems.filter(item => item.subjectId === currentSubject?.id);
      printContent += `<div class="section"><h2>母题整理 (${items.length})</h2>`;
      items.forEach(item => {
        printContent += `<div class="item"><div class="item-title">${item.title}</div><div class="item-content">${item.content}</div></div>`;
      });
      printContent += `</div>`;
    }
    
    if (printOptions.analysis) {
      printContent += `<div class="section"><h2>学习分析</h2>`;
      printContent += `<div class="item"><div class="item-title">总测试次数</div><div class="item-content">${totalTests}次</div></div>`;
      printContent += `<div class="item"><div class="item-title">平均分数</div><div class="item-content">${averageScore.toFixed(1)}</div></div>`;
      printContent += `<div class="item"><div class="item-title">平均正确率</div><div class="item-content">${averageAccuracy.toFixed(1)}%</div></div>`;
      printContent += `</div>`;
    }
    
    if (printOptions.mindmap) {
      const items = knowledgeItems.filter(item => item.subjectId === currentSubject?.id);
      printContent += `<div class="section"><h2>知识思维导图</h2>`;
      printContent += `<div style="margin-left: 20px;">`;
      items.forEach(item => {
        printContent += `<div>${item.title}</div>`;
        if (item.tags && item.tags.length > 0) {
          printContent += `<div style="margin-left: 20px;">标签: ${item.tags.join(', ')}</div>`;
        }
      });
      printContent += `</div></div>`;
    }
    
    printContent += `</body></html>`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    setShowPrintModal(false);
    setPrintOptions({
      knowledge: false,
      memorize: false,
      mistakes: false,
      patterns: false,
      analysis: false,
      mindmap: false,
    });
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Icon name="plus" size={18} />
              <span>添加记录</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Icon name="printer" size={18} />
              <span>打印</span>
            </button>
            {(['week', 'month', 'all', 'custom'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range === 'week' ? '近一周' : range === 'month' ? '近一月' : range === 'all' ? '全部' : '自定义'}
              </button>
            ))}
            {timeRange === 'custom' && (
              <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl p-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-500">至</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
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
                    <div className="text-right mr-4">
                      <div className="text-2xl font-bold text-indigo-600">
                        {record.score}/{record.totalScore}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((record.score / record.totalScore) * 100).toFixed(0)}% 正确率
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Icon name="trash-2" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? '编辑分数记录' : '添加分数记录'}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">测试标题</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="输入测试标题（如：单元测试、月考等）"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">得分</label>
                      <input
                        type="text"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="输入得分（支持小数）"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">总分</label>
                      <input
                        type="text"
                        value={formData.totalScore}
                        onChange={(e) => setFormData({ ...formData, totalScore: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="输入总分（支持小数）"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用时（分钟）</label>
                    <input
                      type="text"
                      value={formData.timeSpent}
                      onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="输入用时（支持小数）"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
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

        {showPrintModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">选择打印内容</h2>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.knowledge}
                      onChange={(e) => setPrintOptions({ ...printOptions, knowledge: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">知识点</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.memorize}
                      onChange={(e) => setPrintOptions({ ...printOptions, memorize: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">必记必背</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.mistakes}
                      onChange={(e) => setPrintOptions({ ...printOptions, mistakes: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">错题整理</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.patterns}
                      onChange={(e) => setPrintOptions({ ...printOptions, patterns: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">母题整理</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.analysis}
                      onChange={(e) => setPrintOptions({ ...printOptions, analysis: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">学习分析</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printOptions.mindmap}
                      onChange={(e) => setPrintOptions({ ...printOptions, mindmap: e.target.checked })}
                      className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">思维导图</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    disabled={!printOptions.knowledge && !printOptions.memorize && !printOptions.mistakes && !printOptions.patterns && !printOptions.analysis && !printOptions.mindmap}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="printer" size={20} />
                    <span>打印</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
