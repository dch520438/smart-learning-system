import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';
import type { Question } from '../types';

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

export function Practice() {
  const navigate = useNavigate();
  const { currentSubject, questions, updateQuestion } = useAppStore();
  
  // 练习配置
  const [practiceConfig, setPracticeConfig] = useState({
    knowledgePoint: 'all',
    difficulty: 'all' as 'all' | 'easy' | 'medium' | 'hard',
    questionCount: 10,
  });
  
  // 练习状态
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectQuestions = questions.filter((q) => q.subjectId === currentSubject.id);
  
  // 提取所有知识点
  const allKnowledgePoints = Array.from(
    new Set(subjectQuestions.flatMap((q) => q.knowledgePoints))
  ).sort();

  useEffect(() => {
    if (isPracticeStarted) {
      const interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [isPracticeStarted]);

  const handleStartPractice = () => {
    let filteredQuestions = subjectQuestions;
    
    // 按知识点过滤
    if (practiceConfig.knowledgePoint !== 'all') {
      filteredQuestions = filteredQuestions.filter((q) => 
        q.knowledgePoints.includes(practiceConfig.knowledgePoint!)
      );
    }
    
    // 按难度过滤
    if (practiceConfig.difficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter((q) => 
        q.difficulty === practiceConfig.difficulty
      );
    }

    if (filteredQuestions.length < practiceConfig.questionCount) {
      alert(`题目数量不足，当前只有 ${filteredQuestions.length} 道题目`);
      return;
    }

    // 随机选择题目
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, practiceConfig.questionCount);
    
    setSelectedQuestions(selected);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowAnswer(false);
    setTimeSpent(0);
    setIsPracticeStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setShowAnswer(false);
  };

  const handleCheckAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleEndPractice = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setIsPracticeStarted(false);
    setSelectedQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowAnswer(false);
    setTimeSpent(0);
  };

  const toggleMistake = (question: Question) => {
    updateQuestion(question.id, { isMistake: !question.isMistake });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isPracticeStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">做题模式</h1>
              <p className="text-gray-600 mt-1">专项练习和强化训练</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">练习配置</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">知识点</label>
                <select
                  value={practiceConfig.knowledgePoint}
                  onChange={(e) => setPracticeConfig({ ...practiceConfig, knowledgePoint: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">全部知识点</option>
                  {allKnowledgePoints.map((kp) => (
                    <option key={kp} value={kp}>{kp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
                <select
                  value={practiceConfig.difficulty}
                  onChange={(e) => setPracticeConfig({ ...practiceConfig, difficulty: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">全部难度</option>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题目数量</label>
                <input
                  type="number"
                  min="1"
                  max={subjectQuestions.length}
                  value={practiceConfig.questionCount}
                  onChange={(e) => setPracticeConfig({ ...practiceConfig, questionCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStartPractice}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="target" size={20} />
                  <span>开始练习</span>
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

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isAnswered = !!answers[currentQuestion.id];
  const isCorrect = isAnswered && answers[currentQuestion.id] === currentQuestion.answer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">做题模式</h1>
            <p className="text-gray-600 mt-1">第 {currentQuestionIndex + 1} 题 / 共 {selectedQuestions.length} 题</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="clock" size={20} className="text-gray-500" />
              <span className="text-gray-700 font-medium">{formatTime(timeSpent)}</span>
            </div>
            <button
              onClick={handleEndPractice}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              结束练习
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="mb-4 flex items-center space-x-3">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: difficultyColors[currentQuestion.difficulty] + '20',
                color: difficultyColors[currentQuestion.difficulty],
              }}
            >
              {difficultyLabels[currentQuestion.difficulty]}
            </span>
            {currentQuestion.knowledgePoints.length > 0 &&
              currentQuestion.knowledgePoints.map((kp, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {kp}
                </span>
              ))}
          </div>
          
          <div className="text-gray-900 mb-6 whitespace-pre-wrap">{currentQuestion.content}</div>

          <div className="space-y-3 mb-6">
            {['A', 'B', 'C', 'D'].map((option) => (
              <div key={option}>
                <input
                  type="radio"
                  id={`option-${option}`}
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswerChange(currentQuestion.id, option)}
                  disabled={showAnswer}
                  className="hidden"
                />
                <label
                  htmlFor={`option-${option}`}
                  className={`block px-4 py-3 border rounded-xl cursor-pointer transition-colors ${
                    showAnswer
                      ? option === currentQuestion.answer
                        ? 'border-green-500 bg-green-50'
                        : answers[currentQuestion.id] === option
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                      : answers[currentQuestion.id] === option
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      showAnswer
                        ? option === currentQuestion.answer
                          ? 'bg-green-500 text-white'
                          : answers[currentQuestion.id] === option
                          ? 'bg-red-500 text-white'
                          : 'border border-gray-300'
                        : answers[currentQuestion.id] === option
                        ? 'bg-teal-500 text-white'
                        : 'border border-gray-300'
                    }`}>
                      {showAnswer && option === currentQuestion.answer && <Icon name="check" size={14} />}
                      {showAnswer && answers[currentQuestion.id] === option && option !== currentQuestion.answer && <Icon name="x" size={14} />}
                    </div>
                    <span className="text-gray-800">{option}. 选项 {option}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {showAnswer && currentQuestion.analysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">解析</h4>
              <p className="text-blue-700 whitespace-pre-wrap">{currentQuestion.analysis}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleMistake(currentQuestion)}
              className={`p-2 rounded-lg transition-colors ${
                currentQuestion.isMistake
                  ? 'bg-red-100 text-red-500'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={currentQuestion.isMistake ? '标记为非错题' : '标记为错题'}
            >
              <Icon name="alert-triangle" size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
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

            {!showAnswer ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  !isAnswered
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                <Icon name="check" size={20} />
                <span>检查答案</span>
              </button>
            ) : currentQuestionIndex === selectedQuestions.length - 1 ? (
              <button
                onClick={handleEndPractice}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Icon name="flag" size={20} />
                <span>完成练习</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <span>下一题</span>
                <Icon name="chevron-right" size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {selectedQuestions.map((_, index) => {
            const question = selectedQuestions[index];
            const isAnswered = !!answers[question.id];
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowAnswer(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-teal-500 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
