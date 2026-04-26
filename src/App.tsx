import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Knowledge } from "./pages/Knowledge";
import { Notes } from "./pages/Notes";
import { Mistakes } from "./pages/Mistakes";
import { Memorize } from "./pages/Memorize";
import { Patterns } from "./pages/Patterns";
import { SamePoint } from "./pages/SamePoint";
import { Test } from "./pages/Test";
import { Practice } from "./pages/Practice";
import { Scores } from "./pages/Scores";
import { Analysis } from "./pages/Analysis";
import { Mindmap } from "./pages/Mindmap";
import { Study } from "./pages/Study";
import { Papers } from "./pages/Papers";
import { Scraper } from "./pages/Scraper";
import { Settings } from "./pages/Settings";
import { SearchPage } from "./pages/SearchPage";
import { Placeholder } from "./pages/Placeholder";
import { AuthPage } from "./pages/AuthPage";
import { useAppStore } from "./store";

// 路由保护组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

export default function App() {
  // 初始化主题设置
  useEffect(() => {
    const applyTheme = () => {
      const themeMode = localStorage.getItem('themeMode') as 'light' | 'dark' | 'system' || 'system';
      const backgroundColor = localStorage.getItem('backgroundColor') as 'default' | 'blue' | 'green' | 'purple' | 'orange' || 'default';
      
      // 应用主题模式
      let isDark = false;
      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      document.documentElement.classList.toggle('dark', isDark);
      
      // 应用背景颜色
      document.documentElement.classList.remove('bg-default', 'bg-blue', 'bg-green', 'bg-purple', 'bg-orange');
      document.documentElement.classList.add(`bg-${backgroundColor}`);
      
      // 也直接设置body样式，确保生效
      let bgColor = '#f9fafb';
      if (backgroundColor === 'blue') bgColor = '#eff6ff';
      else if (backgroundColor === 'green') bgColor = '#f0fdf4';
      else if (backgroundColor === 'purple') bgColor = '#faf5ff';
      else if (backgroundColor === 'orange') bgColor = '#fff7ed';
      
      if (isDark) {
        if (backgroundColor === 'default') bgColor = '#111827';
        else if (backgroundColor === 'blue') bgColor = '#1e3a5f';
        else if (backgroundColor === 'green') bgColor = '#14532d';
        else if (backgroundColor === 'purple') bgColor = '#3b0764';
        else if (backgroundColor === 'orange') bgColor = '#431407';
      }
      document.body.style.backgroundColor = bgColor;
    };
    
    applyTheme();
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (localStorage.getItem('themeMode') === 'system') {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/memorize" element={<Memorize />} />
                <Route path="/mistakes" element={<Mistakes />} />
                <Route path="/patterns" element={<Patterns />} />
                <Route path="/same-point" element={<SamePoint />} />
                <Route path="/test" element={<Test />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/scores" element={<Scores />} />
                <Route path="/study" element={<Study />} />
                <Route path="/papers" element={<Papers />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/mindmap" element={<Mindmap />} />
                <Route path="/scraper" element={<Scraper />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
