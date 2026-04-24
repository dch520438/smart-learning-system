import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

export function Mindmap() {
  const navigate = useNavigate();
  const { currentSubject, knowledgePoints, questions } = useAppStore();

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  const subjectKnowledgePoints = knowledgePoints.filter((kp) => kp.subjectId === currentSubject.id);
  const subjectQuestions = questions.filter((q) => q.subjectId === currentSubject.id);

  // 构建思维导图数据结构
  const buildMindmapData = () => {
    const root = {
      id: 'root',
      title: currentSubject.name,
      children: [],
    };

    // 按知识点分组
    const knowledgeMap = new Map<string, any>();
    
    subjectKnowledgePoints.forEach((kp) => {
      knowledgeMap.set(kp.title, {
        id: kp.id,
        title: kp.title,
        children: [],
      });
    });

    // 将题目添加到对应的知识点
    subjectQuestions.forEach((q) => {
      q.knowledgePoints.forEach((kp) => {
        if (knowledgeMap.has(kp)) {
          knowledgeMap.get(kp).children.push({
            id: q.id,
            title: `题目: ${q.content.substring(0, 20)}...`,
          });
        }
      });
    });

    // 将知识点添加到根节点
    root.children = Array.from(knowledgeMap.values());

    return root;
  };

  const mindmapData = buildMindmapData();

  // 简单的 SVG 思维导图渲染
  const renderMindmap = () => {
    const calculatePositions = (node: any, x: number, y: number, level: number) => {
      const width = 200;
      const height = 60;
      const levelSpacing = 300;
      const nodeSpacing = 80;

      node.x = x;
      node.y = y;
      node.width = width;
      node.height = height;

      if (node.children && node.children.length > 0) {
        const totalHeight = node.children.length * nodeSpacing;
        const startY = y - (totalHeight / 2) + (nodeSpacing / 2);

        node.children.forEach((child: any, index: number) => {
          calculatePositions(child, x + levelSpacing, startY + index * nodeSpacing, level + 1);
        });
      }
    };

    calculatePositions(mindmapData, 100, 300, 0);

    const drawNode = (node: any) => {
      return (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y - node.height / 2}
            width={node.width}
            height={node.height}
            rx={10}
            fill={node.id === 'root' ? '#0EA5E9' : '#E0F2FE'}
            stroke={node.id === 'root' ? '#0284C7' : '#93C5FD'}
            strokeWidth={2}
          />
          <text
            x={node.x + node.width / 2}
            y={node.y + 5}
            textAnchor="middle"
            fill={node.id === 'root' ? 'white' : '#0EA5E9'}
            fontSize="14"
            fontWeight={node.id === 'root' ? 'bold' : 'normal'}
          >
            {node.title}
          </text>
          {node.children && node.children.length > 0 && node.id !== 'root' && (
            node.children.map((child: any) => (
              <line
                key={`${node.id}-${child.id}`}
                x1={node.x + node.width}
                y1={node.y}
                x2={child.x}
                y2={child.y}
                stroke="#93C5FD"
                strokeWidth={2}
              />
            ))
          )}
          {node.children && node.children.length > 0 && (
            node.children.map((child: any) => drawNode(child))
          )}
        </g>
      );
    };

    return (
      <svg width="100%" height="600" className="border border-gray-200 rounded-xl overflow-auto">
        {drawNode(mindmapData)}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">思维导图</h1>
            <p className="text-gray-600 mt-1">知识可视化和结构梳理</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{currentSubject.name} 知识结构</h2>
          
          {subjectKnowledgePoints.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Icon name="network" size={48} className="text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有知识点数据</h3>
              <p className="text-gray-600 mb-6">添加知识点后，这里会生成思维导图</p>
              <button
                onClick={() => navigate('/knowledge')}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <Icon name="plus" size={20} />
                <span>添加知识点</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {renderMindmap()}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">知识点统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="book-open-check" size={24} className="text-sky-500" />
                <h3 className="font-semibold text-gray-900">知识点数量</h3>
              </div>
              <p className="text-3xl font-bold text-sky-600">{subjectKnowledgePoints.length}</p>
            </div>
            <div className="bg-sky-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="alert-triangle" size={24} className="text-sky-500" />
                <h3 className="font-semibold text-gray-900">题目数量</h3>
              </div>
              <p className="text-3xl font-bold text-sky-600">{subjectQuestions.length}</p>
            </div>
            <div className="bg-sky-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="network" size={24} className="text-sky-500" />
                <h3 className="font-semibold text-gray-900">知识关联</h3>
              </div>
              <p className="text-3xl font-bold text-sky-600">
                {subjectKnowledgePoints.reduce((sum, kp) => {
                  const relatedQuestions = subjectQuestions.filter((q) => q.knowledgePoints.includes(kp.title));
                  return sum + relatedQuestions.length;
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">知识点列表</h2>
          <div className="space-y-4">
            {subjectKnowledgePoints.map((kp) => (
              <div key={kp.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{kp.title}</h3>
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    {subjectQuestions.filter((q) => q.knowledgePoints.includes(kp.title)).length} 道题目
                  </span>
                </div>
                {kp.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {kp.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
