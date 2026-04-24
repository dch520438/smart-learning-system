import express, { type Request, type Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

/**
 * 配置示例网站和学科映射
 */
const scraperConfig = {
  knowledgeSites: [
    {
      name: '百度百科',
      baseUrl: 'https://baike.baidu.com',
      searchUrl: 'https://baike.baidu.com/searchword',
    },
    {
      name: '维基百科',
      baseUrl: 'https://zh.wikipedia.org',
      searchUrl: 'https://zh.wikipedia.org/w/index.php',
    },
    {
      name: '中国教育资源网',
      baseUrl: 'https://www.eduzone.com',
    },
    {
      name: '学习强国',
      baseUrl: 'https://www.xuexi.cn',
    },
  ],
  questionSites: [
    {
      name: '猿题库',
      baseUrl: 'https://www.yuantiku.com',
    },
    {
      name: '菁优网',
      baseUrl: 'https://www.jyeoo.com',
    },
    {
      name: '学科网',
      baseUrl: 'https://www.zxxk.com',
    },
    {
      name: '21世纪教育网',
      baseUrl: 'https://www.21cnjy.com',
    },
  ],
};

/**
 * 获取可用的抓取网站列表
 */
router.get('/sites', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: scraperConfig,
  });
});

/**
 * 简单的百度百科抓取示例
 */
router.get('/test-baike', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '请提供搜索关键词',
      });
    }

    // 这里提供一个简单的示例，实际使用时需要根据网站结构调整
    // 注意：由于网站可能会有反爬虫机制，生产环境需要做相应处理
    res.json({
      success: true,
      message: '示例功能，实际使用需要根据网站结构调整',
      data: {
        site: '百度百科',
        keyword,
        note: '由于大多数网站有反爬虫机制，请使用浏览器访问以下方法：',
        manual: [
          '方法1: 使用浏览器扩展抓取器复制内容粘贴',
          '方法2: 使用公开API获取数据',
          '方法3: 手动输入添加',
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
});

/**
 * 获取知识点添加示例 - 实际项目默认的内容
 */
router.get('/suggestions', (req: Request, res: Response) => {
  res.json({
    success: true,
    suggestions: [
      {
        name: '手动添加',
        description: '可以直接在应用中手动添加知识点和题目，最安全可靠',
        steps: ['选择相应页面点击添加按钮，手动输入']
      },
      {
        name: '浏览器访问网站搜索',
        description: '使用浏览器的搜索相关网站，然后复制内容复制内容到应用',
        steps: ['浏览器打开器打开网站搜索', '浏览内容，复制关键']
      },
      {
        name: '浏览器',
        description: '对于PDF和使用工具',
        steps: ['网页', '复制', '内容', '粘贴', '整理保存']
      },
    ],
  });
});

export default router;
