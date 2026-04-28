import { useState } from 'react';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

export function Print() {
  const {
    currentUser,
    knowledgePoints,
    notes,
    questions,
    memorizeItems,
    studyAnalyses,
    testRecords
  } = useAppStore();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: string[]}>({
    knowledge: [],
    notes: [],
    mistakes: [],
    memorize: [],
    analysis: [],
    scores: []
  });

  const allTypes = [
    { id: 'knowledge', label: '知识点', icon: 'book-open-check' },
    { id: 'notes', label: '笔记', icon: 'sticky-note' },
    { id: 'mistakes', label: '错题', icon: 'alert-triangle' },
    { id: 'memorize', label: '必背必记', icon: 'brain' },
    { id: 'analysis', label: '学习分析', icon: 'chart-line' },
    { id: 'scores', label: '成绩记录', icon: 'award' }
  ];

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId) 
        : [...prev, typeId]
    );
  };

  const toggleItem = (type: string, itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(itemId)
        ? prev[type].filter(id => id !== itemId)
        : [...prev[type], itemId]
    }));
  };

  const selectAllInType = (type: string, items: any[]) => {
    if (selectedItems[type].length === items.length) {
      setSelectedItems(prev => ({ ...prev, [type]: [] }));
    } else {
      setSelectedItems(prev => ({ ...prev, [type]: items.map(item => item.id) }));
    }
  };

  const handlePrint = () => {
    // 收集要打印的内容
    let printContent = '<!DOCTYPE html><html><head>';
    printContent += '<meta charset="UTF-8">';
    printContent += '<title>学习资料打印</title>';
    printContent += '<style>';
    printContent += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; line-height: 1.6; }';
    printContent += 'h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }';
    printContent += 'h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }';
    printContent += '.content-item { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }';
    printContent += '.content-title { font-weight: bold; font-size: 1.1em; color: #1f2937; }';
    printContent += '.content-tags { margin-top: 10px; }';
    printContent += '.tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 20px; font-size: 0.9em; margin-right: 5px; }';
    printContent += '.answer { background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px; margin: 10px 0; }';
    printContent += '.analysis { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; }';
    printContent += '@media print { body { margin: 20px; } h1, h2 { page-break-after: avoid; } .content-item { page-break-inside: avoid; } }';
    printContent += '</style>';
    printContent += '</head><body>';
    printContent += `<h1>学习资料打印 - ${currentUser?.username || '用户'}</h1>`;
    printContent += `<p style="color: #6b7280;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>`;

    // 添加知识点
    if (selectedTypes.includes('knowledge') && selectedItems.knowledge.length > 0) {
      printContent += '<h2>知识点</h2>';
      knowledgePoints.filter(kp => selectedItems.knowledge.includes(kp.id)).forEach(kp => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">${kp.title}</div>`;
        printContent += `<div style="margin-top: 10px;">${kp.content}</div>`;
        if (kp.tags.length > 0) {
          printContent += '<div class="content-tags">';
          kp.tags.forEach(tag => {
            printContent += `<span class="tag">${tag}</span>`;
          });
          printContent += '</div>';
        }
        printContent += '</div>';
      });
    }

    // 添加笔记
    if (selectedTypes.includes('notes') && selectedItems.notes.length > 0) {
      printContent += '<h2>笔记</h2>';
      notes.filter(note => selectedItems.notes.includes(note.id)).forEach(note => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">${note.title}</div>`;
        printContent += `<div style="margin-top: 10px;">${note.content}</div>`;
        if (note.tags.length > 0) {
          printContent += '<div class="content-tags">';
          note.tags.forEach(tag => {
            printContent += `<span class="tag">${tag}</span>`;
          });
          printContent += '</div>';
        }
        printContent += '</div>';
      });
    }

    // 添加错题
    if (selectedTypes.includes('mistakes') && selectedItems.mistakes.length > 0) {
      printContent += '<h2>错题</h2>';
      questions.filter(q => selectedItems.mistakes.includes(q.id)).forEach(question => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">题目</div>`;
        printContent += `<div style="margin-top: 10px;">${question.content}</div>`;
        if (question.answer) {
          printContent += '<div class="answer">';
          printContent += '<div style="font-weight: bold; margin-bottom: 5px;">答案</div>';
          printContent += question.answer;
          printContent += '</div>';
        }
        if (question.analysis) {
          printContent += '<div class="analysis">';
          printContent += '<div style="font-weight: bold; margin-bottom: 5px;">解析</div>';
          printContent += question.analysis;
          printContent += '</div>';
        }
        printContent += '</div>';
      });
    }

    // 添加必背必记
    if (selectedTypes.includes('memorize') && selectedItems.memorize.length > 0) {
      printContent += '<h2>必背必记</h2>';
      memorizeItems.filter(item => selectedItems.memorize.includes(item.id)).forEach(item => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">${item.title}</div>`;
        printContent += `<div style="margin-top: 10px;">${item.content}</div>`;
        if (item.tags.length > 0) {
          printContent += '<div class="content-tags">';
          item.tags.forEach(tag => {
            printContent += `<span class="tag">${tag}</span>`;
          });
          printContent += '</div>';
        }
        printContent += '</div>';
      });
    }

    // 添加学习分析
    if (selectedTypes.includes('analysis') && selectedItems.analysis.length > 0) {
      printContent += '<h2>学习分析</h2>';
      studyAnalyses.filter(a => selectedItems.analysis.includes(a.id)).forEach(analysis => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">学习分析报告</div>`;
        if (analysis.weakPoints.length > 0) {
          printContent += '<div style="margin-top: 10px;"><strong>薄弱点:</strong> ' + analysis.weakPoints.join(', ') + '</div>';
        }
        if (analysis.suggestions.length > 0) {
          printContent += '<div style="margin-top: 10px;"><strong>建议:</strong> ' + analysis.suggestions.join(', ') + '</div>';
        }
        printContent += '</div>';
      });
    }

    // 添加成绩记录
    if (selectedTypes.includes('scores') && selectedItems.scores.length > 0) {
      printContent += '<h2>成绩记录</h2>';
      testRecords.filter(r => selectedItems.scores.includes(r.id)).forEach(record => {
        printContent += '<div class="content-item">';
        printContent += `<div class="content-title">${record.title}</div>`;
        printContent += `<div style="margin-top: 10px;">成绩: ${record.score}/${record.totalScore}</div>`;
        printContent += `<div style="margin-top: 5px; color: #6b7280;">测试时间: ${new Date(record.createdAt).toLocaleString('zh-CN')}</div>`;
        printContent += '</div>';
      });
    }

    printContent += '</body></html>';

    // 打开打印窗口
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">打印学习资料</h1>
          <p className="text-gray-600">选择要打印的内容类型和具体项目</p>
        </div>

        {/* 选择内容类型 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="layers" size={24} className="mr-2 text-indigo-500" />
            选择内容类型
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allTypes.map(type => (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-2 ${
                  selectedTypes.includes(type.id)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon name={type.icon as any} size={24} />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 显示可选择的项目 */}
        {selectedTypes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="check-list" size={24} className="mr-2 text-indigo-500" />
              选择具体项目
            </h2>

            {/* 知识点 */}
            {selectedTypes.includes('knowledge') && knowledgePoints.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">知识点 ({knowledgePoints.length})</h3>
                  <button
                    onClick={() => selectAllInType('knowledge', knowledgePoints)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.knowledge.length === knowledgePoints.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {knowledgePoints.map(kp => (
                    <label
                      key={kp.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.knowledge.includes(kp.id)}
                        onChange={() => toggleItem('knowledge', kp.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700">{kp.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 笔记 */}
            {selectedTypes.includes('notes') && notes.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">笔记 ({notes.length})</h3>
                  <button
                    onClick={() => selectAllInType('notes', notes)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.notes.length === notes.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {notes.map(note => (
                    <label
                      key={note.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.notes.includes(note.id)}
                        onChange={() => toggleItem('notes', note.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700">{note.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 错题 */}
            {selectedTypes.includes('mistakes') && questions.filter(q => q.isMistake).length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">错题 ({questions.filter(q => q.isMistake).length})</h3>
                  <button
                    onClick={() => selectAllInType('mistakes', questions.filter(q => q.isMistake))}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.mistakes.length === questions.filter(q => q.isMistake).length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {questions.filter(q => q.isMistake).map(question => (
                    <label
                      key={question.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.mistakes.includes(question.id)}
                        onChange={() => toggleItem('mistakes', question.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700 truncate">{question.content.substring(0, 50)}...</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 必背必记 */}
            {selectedTypes.includes('memorize') && memorizeItems.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">必背必记 ({memorizeItems.length})</h3>
                  <button
                    onClick={() => selectAllInType('memorize', memorizeItems)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.memorize.length === memorizeItems.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {memorizeItems.map(item => (
                    <label
                      key={item.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.memorize.includes(item.id)}
                        onChange={() => toggleItem('memorize', item.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700">{item.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 学习分析 */}
            {selectedTypes.includes('analysis') && studyAnalyses.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">学习分析 ({studyAnalyses.length})</h3>
                  <button
                    onClick={() => selectAllInType('analysis', studyAnalyses)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.analysis.length === studyAnalyses.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {studyAnalyses.map(analysis => (
                    <label
                      key={analysis.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.analysis.includes(analysis.id)}
                        onChange={() => toggleItem('analysis', analysis.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700">分析报告 - {new Date(analysis.createdAt).toLocaleDateString('zh-CN')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 成绩记录 */}
            {selectedTypes.includes('scores') && testRecords.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">成绩记录 ({testRecords.length})</h3>
                  <button
                    onClick={() => selectAllInType('scores', testRecords)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {selectedItems.scores.length === testRecords.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2">
                  {testRecords.map(record => (
                    <label
                      key={record.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.scores.includes(record.id)}
                        onChange={() => toggleItem('scores', record.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 flex-1 text-gray-700">{record.title} - {record.score}/{record.totalScore}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 打印按钮 */}
        <button
          onClick={handlePrint}
          disabled={selectedTypes.length === 0 || Object.values(selectedItems).every(arr => arr.length === 0)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Icon name="printer" size={24} />
          <span className="text-lg">打印选中的内容</span>
        </button>
      </div>
    </div>
  );
}
