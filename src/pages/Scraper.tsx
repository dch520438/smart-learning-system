import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';

interface ScraperSite {
  name: string;
  baseUrl: string;
  searchUrl?: string;
}

interface ScraperConfig {
  knowledgeSites: ScraperSite[];
  questionSites: ScraperSite[];
}

export function Scraper() {
  const navigate = useNavigate();
  
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
