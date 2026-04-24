import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { useAppStore } from '../store';

interface PlaceholderProps {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export function Placeholder({ title, description, icon, color }: PlaceholderProps) {
  const navigate = useNavigate();
  const { currentSubject } = useAppStore();

  if (!currentSubject) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div
          className="w-32 h-32 rounded-3xl mx-auto flex items-center justify-center mb-8"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon name={icon} size={64} style={{ color }} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{description}</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-800">
            此功能正在开发中，敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
}
