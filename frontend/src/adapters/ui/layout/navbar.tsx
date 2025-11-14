import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'routes', label: 'Routes', path: '/routes' },
    { id: 'compare', label: 'Compare', path: '/compare' },
    { id: 'banking', label: 'Banking', path: '/banking' },
    { id: 'pooling', label: 'Pooling', path: '/pooling' },
  ];

  const selectedTab = navItems.find((item: NavItem) => location.pathname.startsWith(item.path))?.id || 'routes';

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
                selectedTab === item.id
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
