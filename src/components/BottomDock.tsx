import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Bot, History, User } from 'lucide-react';
import { cn } from '../lib/cn';

const items = [
  { label: '首页', path: '/', icon: Home, match: (p: string) => p === '/' },
  { label: '场景', path: '/scenarios', icon: Compass, match: (p: string) => p.startsWith('/scenarios') || p.startsWith('/guide/') || p.startsWith('/task/') || p.startsWith('/materials/') || p.startsWith('/material-guide/') || p.startsWith('/process/') || p.startsWith('/official/') || p.startsWith('/tutorial/') },
  { label: '教练', path: '/coach', icon: Bot, match: (p: string) => p.startsWith('/coach') || p.startsWith('/onsite/') },
  { label: '记录', path: '/history', icon: History, match: (p: string) => p.startsWith('/history') },
  { label: '我的', path: '/profile', icon: User, match: (p: string) => p.startsWith('/profile') },
];

export default function BottomDock() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[min(92vw,400px)]">
      <div className="dock-shell">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(location.pathname);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn('dock-item', active && 'is-active')}
            >
              <span className="dock-icon">
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="dock-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
