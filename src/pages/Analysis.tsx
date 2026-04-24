import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export function Analysis() {
  const navigate = useNavigate();
  const { currentSubject, questions, testRecords, memorizeItems, knowledgePoints } = useAppStore();

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectQuestions = questions.filter((q) => q.subjectId === currentSubject.id);
  const subjectTestRecords = testRecords.filter((record) => record.subjectId === currentSubject.id);
  const subjectMemorizeItems = memorizeItems.filter((item) => item.subjectId === currentSubject.id);
  const subjectKnowledgePoints = knowledgePoints.filter((kp) => kp.subjectId === currentSubject.id);

  // 知识点掌握情况分析
  const knowledgePointAnalysis = subjectKnowledgePoints.map((kp) => {
    // 找出与该知识点相关的题目
    const relatedQuestions = subjectQuestions.filter((q) => q.knowledgePoints.includes(kp.title));
    if (relatedQuestions.length === 0) {
      return { name: kp.title, value: 0, fullMark: 100 };
    }
    
    // 计算正确率
    const correctCount = relatedQuestions.filter((q) => !q.isMistake).length;
    const accuracy = (correctCount / relatedQuestions.length) * 100;
    return { name: kp.title, value: accuracy, fullMark: 100 };
  }).filter((item) => item.value > 0);

  // 错题难度分布
  const mistakeDifficultyData = [
    { name: '简单', value: subjectQuestions.filter((q) => q.isMistake && q.difficulty === 'easy').length },
    { name: '中等', value: subjectQuestions.filter((q) => q.isMistake && q.difficulty === 'medium').length },
    { name: '困难', value: subjectQuestions.filter((q) => q.isMistake && q.difficulty === 'hard').length },
  ];

  // 记忆进度分析
  const memorizeProgress = subjectMemorizeItems.length > 0
    ? (subjectMemorizeItems.filter((item) => item.isMemorized).length / subjectMemorizeItems.length) * 100
    : 0;

  // 学习习惯分析
  const studyHabits = {
    totalQuestions: subjectQuestions.length,
    totalTests: subjectTestRecords.length,
    totalMemorizeItems: subjectMemorizeItems.length,
    totalKnowledgePoints: subjectKnowledgePoints.length,
    mistakeRate: subjectQuestions.length > 0
      ? (subjectQuestions.filter((q) => q.isMistake).length / subjectQuestions.length) * 100
      : 0,
    averageScore: subjectTestRecords.length > 0
      ? subjectTestRecords.reduce((sum, record) => sum + record.score, 0) / subjectTestRecords.length
      : 0,
  };

  // 学习建议
  const generateSuggestions = () => {
    const suggestions = [];
    
    if (studyHabits.mistakeRate > 30) {
      suggestions.push('建议加强基础知识的学习，重点关注错题集中的知识点');
    }
    
    if (memorizeProgress < 50) {
      suggestions.push('建议增加必背内容的记忆时间，提高记忆效率');
    }
    
    if (studyHabits.totalTests < 5) {
      suggestions.push('建议多进行模拟测试，熟悉考试题型和节奏');
    }
    
    if (knowledgePointAnalysis.length > 0) {
      const weakPoints = knowledgePointAnalysis
        .filter((item) => item.value < 60)
        .map((item) => item.name);
      
      if (weakPoints.length > 0) {
        suggestions.push(`建议重点复习以下知识点：${weakPoints.join('、')}`);
      }
    }
    
    if (suggestions.length === 0) {
      suggestions.push('学习情况良好，继续保持当前的学习节奏');
      suggestions.push('建议尝试挑战更高难度的题目，进一步提升能力');
    }
    
    return suggestions;
  };

  const suggestions = generateSuggestions();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">学习分析</h1>
            <p className="text-gray-600 mt-1">智能分析学习情况和建议</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">知识点掌握情况</h2>
            <div className="h-80">
              {knowledgePointAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={knowledgePointAnalysis}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="掌握程度"
                      dataKey="value"
                      stroke="#FF7E1E"
                      fill="#FF7E1E"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">暂无知识点数据</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">错题难度分布</h2>
            <div className="h-80">
              {mistakeDifficultyData.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mistakeDifficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mistakeDifficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">暂无错题数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="alert-triangle" size={24} className="text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{studyHabits.mistakeRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">错题率</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="brain" size={24} className="text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{memorizeProgress.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">记忆进度</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="play" size={24} className="text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{studyHabits.totalTests}</div>
            <div className="text-sm text-gray-600">测试次数</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="target" size={24} className="text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{studyHabits.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">平均分数</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">学习建议</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="lightbulb" size={16} className="text-orange-500" />
                </div>
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">学习统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">知识点分布</h3>
              <div className="space-y-2">
                {subjectKnowledgePoints.map((kp, index) => (
                  <div key={kp.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{kp.title}</span>
                    <span className="text-gray-500 text-sm">
                      {subjectQuestions.filter((q) => q.knowledgePoints.includes(kp.title)).length} 道题目
                    </span>
                  </div>
                ))}
                {subjectKnowledgePoints.length === 0 && (
                  <p className="text-gray-500">暂无知识点数据</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">学习习惯</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">总题目数</span>
                  <span className="font-medium text-gray-900">{studyHabits.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">总知识点数</span>
                  <span className="font-medium text-gray-900">{studyHabits.totalKnowledgePoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">必背内容数</span>
                  <span className="font-medium text-gray-900">{studyHabits.totalMemorizeItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">已记忆内容</span>
                  <span className="font-medium text-gray-900">
                    {subjectMemorizeItems.filter((item) => item.isMemorized).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
