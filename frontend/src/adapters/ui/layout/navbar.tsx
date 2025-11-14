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
    { id: 'routes', label: 'Routes', path: '/routes', icon: <Route className="w-5 h-5" /> },
    { id: 'compare', label: 'Compare', path: '/compare', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'banking', label: 'Banking', path: '/banking', icon: <Landmark className="w-5 h-5" /> },
    { id: 'pooling', label: 'Pooling', path: '/pooling', icon: <Users className="w-5 h-5" /> },
  ];

  const selectedTab = navItems.find((item: NavItem) => location.pathname.startsWith(item.path))?.id || 'routes';

  return (
    <nav className="bg-secondary-900 shadow-md border-b border-secondary-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex gap-2 justify-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 px-6 py-4 font-medium text-sm transition-all border-b-2 ${
                selectedTab === item.id
                  ? 'border-accent-500 text-white bg-secondary-800/80'
                  : 'border-transparent text-secondary-300 hover:text-white hover:bg-secondary-800/50'
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
