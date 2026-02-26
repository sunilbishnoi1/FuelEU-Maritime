import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route, BarChart3, Landmark, Users } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'routes', label: 'Routes', path: '/routes', icon: <Route className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', path: '/compare', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'banking', label: 'Banking', path: '/banking', icon: <Landmark className="w-4 h-4" /> },
    { id: 'pooling', label: 'Pooling', path: '/pooling', icon: <Users className="w-4 h-4" /> },
  ];

  const selectedTab = navItems.find((item: NavItem) => location.pathname.startsWith(item.path))?.id || 'routes';

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-[1400px]">
        <div className="flex gap-8 overflow-x-auto hide-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-1 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                selectedTab === item.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
