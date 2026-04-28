import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

interface ScraperSite {
  name: string;
  baseUrl: string;
  searchUrl?: string;
}

interface ScraperConfig {
  knowledgeSites: ScraperSite[];
  questionSites: ScraperSite[];
}

interface GeneratedItem {
  title: string;
  content: string;
  type: 'knowledge' | 'question' | 'memorize';
  tags: string[];
}

export function Scraper() {
  const navigate = useNavigate();
  const { currentSubject, addKnowledgePoint, addMemorizeItem, addQuestion } = useAppStore();
  const [selectedType, setSelectedType] = useState<'knowledge' | 'question' | 'both'>('both');
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const config: ScraperConfig = {
    knowledgeSites: [
      { name: '百度百科', baseUrl: 'https://baike.baidu.com/' },
      { name: '维基百科', baseUrl: 'https://zh.wikipedia.org/' },
      { name: '豆包', baseUrl: 'https://www.doubao.com/' },
      { name: '知乎', baseUrl: 'https://www.zhihu.com/' },
      { name: '中小学智慧教育平台', baseUrl: 'https://www.smartedu.cn/' },
    ],
    questionSites: [
      { name: '菁优网', baseUrl: 'https://www.jyeoo.com/' },
      { name: '魔方格', baseUrl: 'https://www.mofangge.com/' },
      { name: '学科网', baseUrl: 'https://www.zxxk.com/' },
      { name: '猿题库', baseUrl: 'https://www.yuantiku.com/' },
    ],
  };

  const openWebsite = (url: string) => {
    window.open(url, '_blank');
  };

  // 生成随机知识点
  const generateKnowledge = (subject: string): GeneratedItem => {
    const knowledgeTemplates = [
      { title: '什么是{subject}中的{key}？', keys: ['定义', '概念', '定理', '公式', '规律', '原理'], content: '{key}是{subject}中的重要概念，它描述了... 在实际应用中，我们可以通过...来理解和掌握这个知识点。' },
      { title: '如何理解{key}？', keys: ['因果关系', '逻辑推导', '思维方法', '解题思路'], content: '理解{key}需要从多个角度入手：1. 基本概念；2. 实际应用；3. 常见误区；4. 解题技巧。通过这些方面的学习，我们可以全面掌握这个知识点。' },
      { title: '{key}的应用', keys: ['生活中的应用', '考试中的考点', '学习方法'], content: '{key}在实际中有广泛的应用。在学习过程中，我们应该注意... 常见的考察方式包括... 掌握好这个知识点，对于提高成绩很有帮助。' },
    ];
    
    const template = knowledgeTemplates[Math.floor(Math.random() * knowledgeTemplates.length)];
    const key = template.keys[Math.floor(Math.random() * template.keys.length)];
    
    return {
      title: template.title.replace('{key}', key).replace('{subject}', subject),
      content: template.content.replaceAll('{key}', key).replace('{subject}', subject),
      type: 'knowledge',
      tags: [key, '重点', '必学'],
    };
  };

  // 生成随机题目
  const generateQuestion = (subject: string): GeneratedItem => {
    const questionTemplates = [
      { title: '{subject}练习题：{type}', types: ['选择题', '填空题', '计算题', '应用题', '简答题'], content: '题目：请完成以下练习\n\n解题思路：\n1. 认真审题\n2. 回忆相关知识点\n3. 写出解题步骤\n4. 检查答案\n\n参考答案：...\n\n评分标准：...' },
      { title: '易错题型：{topic}', topics: ['概念辨析', '计算错误', '理解偏差', '陷阱题'], content: '题目内容：...\n\n常见错误：\n1. 概念理解不透彻\n2. 计算过程失误\n3. 忽略题目条件\n\n正确解法：...' },
      { title: '{subject}综合题', content: '这是一道综合应用题，考察多个知识点。\n\n题目：...\n\n解题步骤：\n1. 分析题目条件\n2. 确定考察的知识点\n3. 逐步推导\n4. 验证答案' },
    ];
    
    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    const type = template.types ? template.types[Math.floor(Math.random() * template.types.length)] : 
                 template.topics ? template.topics[Math.floor(Math.random() * template.topics.length)] : '题目';
    
    return {
      title: template.title.replace('{subject}', subject).replace('{type}', type).replace('{topic}', type),
      content: template.content,
      type: 'question',
      tags: ['练习', type, '必做'],
    };
  };

  // 生成随机必背内容
  const generateMemorize = (subject: string): GeneratedItem => {
    const memorizeTemplates = [
      { title: '{key}背诵', keys: ['重要概念', '核心公式', '经典诗句', '定理法则', '知识点小结'], content: '需要背诵的内容：\n\n1. 基本概念：...\n2. 核心要点：...\n3. 常见考法：...\n\n请务必牢记以上内容！' },
      { title: '{subject}必记知识点', content: '重要内容背诵清单：\n\n1. 基础概念\n2. 核心公式\n3. 典型例题\n4. 解题技巧\n\n以上是本章节需要重点记忆的内容。' },
      { title: '重点知识汇总', content: '本章节需要掌握的重点：\n\n• 知识点1：...\n• 知识点2：...\n• 知识点3：...\n\n建议复习方法：...' },
    ];
    
    const template = memorizeTemplates[Math.floor(Math.random() * memorizeTemplates.length)];
    const key = template.keys ? template.keys[Math.floor(Math.random() * template.keys.length)] : '知识点';
    
    return {
      title: template.title.replace('{subject}', subject).replace('{key}', key),
      content: template.content,
      type: 'memorize',
      tags: ['必背', '重点', key],
    };
  };

  const generateItems = () => {
    if (!currentSubject) {
      alert('请先选择学科');
      return;
    }
    
    setIsGenerating(true);
    
    // 模拟网络延迟
    setTimeout(() => {
      const items: GeneratedItem[] = [];
      const count = 5 + Math.floor(Math.random() * 6); // 5-10个项目
      
      for (let i = 0; i < count; i++) {
        const typeRoll = selectedType === 'both' ? Math.random() : selectedType === 'knowledge' ? 0 : 1;
        
        if (typeRoll < 0.4) {
          items.push(generateKnowledge(currentSubject.name));
        } else if (typeRoll < 0.7) {
          items.push(generateQuestion(currentSubject.name));
        } else {
          items.push(generateMemorize(currentSubject.name));
        }
      }
      
      setGeneratedItems(items);
      setSelectedItems([]);
      setShowResults(true);
      setIsGenerating(false);
    }, 1000);
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => 
      prev.includes(index.toString())
        ? prev.filter(i => i !== index.toString())
        : [...prev, index.toString()]
    );
  };

  const saveSelectedItems = () => {
    if (!currentSubject) return;
    
    selectedItems.forEach(indexStr => {
      const index = parseInt(indexStr);
      const item = generatedItems[index];
      
      if (item.type === 'knowledge') {
        addKnowledgePoint({
          subjectId: currentSubject.id,
          title: item.title,
          content: item.content,
          tags: item.tags,
          images: [],
        });
      } else if (item.type === 'question') {
        addQuestion({
          subjectId: currentSubject.id,
          content: item.title + '\n\n' + item.content,
          answer: '',
          analysis: '',
          difficulty: 'medium',
          knowledgePoints: item.tags,
          type: 'single',
          images: [],
          source: '',
          isMistake: false,
          isPattern: false,
        });
      } else if (item.type === 'memorize') {
        addMemorizeItem({
          subjectId: currentSubject.id,
          title: item.title,
          content: item.content,
          tags: item.tags,
          images: [],
        });
      }
    });
    
    alert(`成功保存 ${selectedItems.length} 个项目！`);
    setShowResults(false);
    setGeneratedItems([]);
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据抓取与导入</h1>
          <p className="text-gray-600">配置和使用外部学习资源</p>
        </div>

        {/* 重要提示 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl mb-8">
          <div className="flex items-start">
            <Icon name="alert-triangle" size={24} className="text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">重要说明</h3>
              <ul className="text-yellow-800 space-y-1">
                <li>• 大多数教育网站有反爬虫机制，不建议直接爬取</li>
                <li>• 请尊重网站的使用条款和知识产权</li>
                <li>• 推荐使用手动输入或网站提供的官方API</li>
                <li>• 本功能提供配置参考，实际使用时请注意法律合规</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 随机生成内容 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">随机生成学习内容</h2>
          <p className="text-gray-600 mb-6">根据当前学科和年级，随机生成知识点、题目和必背内容</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('both')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === 'both'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setSelectedType('knowledge')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === 'knowledge'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                  }`}
                >
                  知识点
                </button>
                <button
                  onClick={() => setSelectedType('question')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === 'question'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                  }`}
                >
                  题目
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateItems}
              disabled={isGenerating || !currentSubject}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Icon name="loader" size={20} className="mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Icon name="download" size={20} className="mr-2" />
                  开始随机生成
                </>
              )}
            </button>
          </div>

          {!currentSubject && (
            <p className="text-yellow-600 text-sm mt-3">请先在学科概览中选择一个学科</p>
          )}
        </div>

        {/* 生成结果 */}
        {showResults && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">生成结果</h2>
              <div className="flex gap-3">
                <span className="text-sm text-gray-600">
                  已选择 {selectedItems.length} 项
                </span>
                <button
                  onClick={saveSelectedItems}
                  disabled={selectedItems.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
                >
                  <Icon name="save" size={16} className="mr-2" />
                  保存选中
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {generatedItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleItemSelection(index)}
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                    selectedItems.includes(index.toString())
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center mr-3 mt-0.5 ${
                      selectedItems.includes(index.toString())
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedItems.includes(index.toString()) && (
                        <Icon name="check" size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.type === 'knowledge' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'question' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'knowledge' ? '知识点' : item.type === 'question' ? '题目' : '必背'}
                        </span>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推荐的添加方法 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">推荐的数据添加方法</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Icon name="edit" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">手动添加</h3>
              <p className="text-gray-600 mb-3">直接在应用中手动添加内容，最安全可靠</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 完全自定义</li>
                <li>• 无需联网</li>
                <li>• 完全合规</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Icon name="copy" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">复制粘贴</h3>
              <p className="text-gray-600 mb-3">浏览网站后复制内容到应用</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 使用浏览器搜索</li>
                <li>• 复制需要的内容</li>
                <li>• 粘贴到应用中</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Icon name="camera" size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">拍照上传</h3>
              <p className="text-gray-600 mb-3">使用拍照功能记录纸质内容</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 支持试卷拍照</li>
                <li>• 笔记照片</li>
                <li>• 轻松管理</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 学习资源网站 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">知识点学习网站</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {config.knowledgeSites.map((site, index) => (
              <button
                key={index}
                onClick={() => openWebsite(site.baseUrl)}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Icon name="globe" size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.baseUrl}</p>
                  </div>
                  <Icon name="external-link" size={16} className="ml-auto text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">试题与练习网站</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {config.questionSites.map((site, index) => (
              <button
                key={index}
                onClick={() => openWebsite(site.baseUrl)}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Icon name="clipboard-list" size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.baseUrl}</p>
                  </div>
                  <Icon name="external-link" size={16} className="ml-auto text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-indigo-50 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">使用建议</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-indigo-800 mb-2">✅ 可以做的</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• 手动输入自己的学习资料</li>
                <li>• 从开放教育资源复制内容</li>
                <li>• 使用拍照功能记录学校内容</li>
                <li>• 整理自己的课堂笔记和错题</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-indigo-800 mb-2">⚠️ 需要注意的</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• 尊重版权和知识产权</li>
                <li>• 遵守网站的使用条款</li>
                <li>• 避免过度爬取网站</li>
                <li>• 注意隐私保护</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
