import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Question, MemorizeItem } from '../types';

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

export function Test() {
  const navigate = useNavigate();
  const { currentSubject, questions, memorizeItems, addTestRecord } = useAppStore();
  
  // 测试配置
  const [testConfig, setTestConfig] = useState({
    title: '',
    questionCount: 5,
    difficulty: 'all' as 'all' | 'easy' | 'medium' | 'hard',
    includeMemorize: false,
  });
  
  // 测试状态
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Array<Question | (MemorizeItem & { type: 'memorize'; answer: string })>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectQuestions = questions.filter((q) => q.subjectId === currentSubject.id);
  const subjectMemorizeItems = memorizeItems.filter((item) => item.subjectId === currentSubject.id);

  useEffect(() => {
    if (isTestStarted && !isTestFinished) {
      const interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [isTestStarted, isTestFinished]);

  const handleStartTest = () => {
    if (!testConfig.title) {
      alert('请输入测试标题');
      return;
    }

    let filteredQuestions = subjectQuestions;
    if (testConfig.difficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter((q) => q.difficulty === testConfig.difficulty);
    }

    let totalItems: Array<Question | (MemorizeItem & { type: 'memorize'; answer: string })> = [...filteredQuestions];
    
    // 如果包含必背必记内容
    if (testConfig.includeMemorize && subjectMemorizeItems.length > 0) {
      // 将必背必记内容转换为测试项目
      const memorizeTestItems = subjectMemorizeItems.map(item => ({
        ...item,
        type: 'memorize' as const,
        answer: item.content, // 答案就是必背内容
      }));
      totalItems = [...totalItems, ...memorizeTestItems];
    }

    if (totalItems.length < testConfig.questionCount) {
      alert(`题目数量不足，当前只有 ${totalItems.length} 道题目`);
      return;
    }

    // 随机选择题目
    const shuffled = totalItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, testConfig.questionCount);
    
    setSelectedQuestions(selected);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setTotalScore(selected.length);
    setTimeSpent(0);
    setIsTestStarted(true);
    setIsTestFinished(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // 计算分数
    let correctCount = 0;
    selectedQuestions.forEach((question) => {
      if ('type' in question && question.type === 'memorize') {
        // 对于必背必记内容，使用相似度计算
        const userAnswer = answers[question.id] || '';
        const originalAnswer = question.answer || '';
        
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
        if (similarity >= 0.8) {
          correctCount++;
        }
      } else {
        // 对于普通题目，完全匹配
        if (answers[question.id] === question.answer) {
          correctCount++;
        }
      }
    });

    const finalScore = correctCount;
    setScore(finalScore);
    setIsTestFinished(true);

    // 保存测试记录
    addTestRecord({
      subjectId: currentSubject.id,
      title: testConfig.title,
      score: finalScore,
      totalScore: selectedQuestions.length,
      questions: selectedQuestions.map((q) => q.id),
      answers,
      timeSpent,
    });
  };

  const handleRestart = () => {
    setIsTestStarted(false);
    setIsTestFinished(false);
    setSelectedQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setTotalScore(0);
    setTimeSpent(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">模拟测试</h1>
              <p className="text-gray-600 mt-1">模拟考试和练习</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">测试配置</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">测试标题</label>
                <input
                  type="text"
                  value={testConfig.title}
                  onChange={(e) => setTestConfig({ ...testConfig, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="输入测试标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题目数量</label>
                <input
                  type="number"
                  min="1"
                  max={subjectQuestions.length}
                  value={testConfig.questionCount}
                  onChange={(e) => setTestConfig({ ...testConfig, questionCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
                <select
                  value={testConfig.difficulty}
                  onChange={(e) => setTestConfig({ ...testConfig, difficulty: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">全部难度</option>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={testConfig.includeMemorize}
                    onChange={(e) => setTestConfig({ ...testConfig, includeMemorize: e.target.checked })}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">包含必背必记内容</span>
                </label>
                {testConfig.includeMemorize && subjectMemorizeItems.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">当前学科没有必背必记内容</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStartTest}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="play" size={20} />
                  <span>开始测试</span>
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                共有 {subjectQuestions.length} 道题目可供选择
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTestFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">模拟测试</h1>
              <p className="text-gray-600 mt-1">测试结果</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-6">
              <div className="text-white text-4xl font-bold">{score}/{totalScore}</div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">测试完成！</h2>
            <p className="text-gray-600 mb-6">用时 {formatTime(timeSpent)}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{score}</div>
                <div className="text-sm text-gray-600">正确题数</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round((score / totalScore) * 100)}%</div>
                <div className="text-sm text-gray-600">正确率</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleRestart}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="refresh-cw" size={20} />
                <span>重新测试</span>
              </button>
              
              <button
                onClick={() => navigate('/scores')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="trending-up" size={20} />
                <span>查看历史记录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{testConfig.title}</h1>
            <p className="text-gray-600 mt-1">第 {currentQuestionIndex + 1} 题 / 共 {selectedQuestions.length} 题</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="clock" size={20} className="text-gray-500" />
              <span className="text-gray-700 font-medium">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          {('type' in currentQuestion && currentQuestion.type === 'memorize') ? (
            <>
              <div className="mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  必背必记
                </span>
              </div>
              
              <div className="text-gray-900 mb-6">
                <p className="mb-4">请默写以下内容：</p>
                <h3 className="text-xl font-semibold mb-4">{currentQuestion.title}</h3>
              </div>

              <div className="space-y-3">
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[200px]"
                  placeholder="请在此处输入答案"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: difficultyColors[(currentQuestion as Question).difficulty] + '20',
                    color: difficultyColors[(currentQuestion as Question).difficulty],
                  }}
                >
                  {difficultyLabels[(currentQuestion as Question).difficulty]}
                </span>
              </div>
              
              <div className="text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option}>
                    <input
                      type="radio"
                      id={`option-${option}`}
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(currentQuestion.id, option)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`option-${option}`}
                      className={`block px-4 py-3 border rounded-xl cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? 'bg-pink-500 text-white'
                            : 'border border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === option && <Icon name="check" size={14} />}
                        </div>
                        <span className="text-gray-800">{option}. 选项 {option}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon name="chevron-left" size={20} />
            <span>上一题</span>
          </button>

          {currentQuestionIndex === selectedQuestions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Icon name="check" size={20} />
              <span>提交测试</span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <span>下一题</span>
              <Icon name="chevron-right" size={20} />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {selectedQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-pink-500 text-white'
                  : answers[selectedQuestions[index].id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
