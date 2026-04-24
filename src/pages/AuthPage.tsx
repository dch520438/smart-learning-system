import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAppStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      // 登录逻辑
      if (!email || !password) {
        setError('请输入邮箱和密码');
        return;
      }
      
      const success = login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('邮箱或密码错误');
      }
    } else {
      // 注册逻辑
      if (!username || !email || !password) {
        setError('请填写所有字段');
        return;
      }
      
      const success = register(username, email, password);
      if (success) {
        setSuccess('注册成功，正在登录...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError('邮箱已被注册');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon name="brain" size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isLogin ? '登录' : '注册'}</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? '欢迎回来' : '创建新账户'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <Icon name="alert-circle" size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <Icon name="check-circle" size={20} className="mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入用户名"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Icon name={isLogin ? 'log-in' : 'user-plus'} size={20} />
            <span>{isLogin ? '登录' : '注册'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:text-blue-600 font-medium ml-1"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
