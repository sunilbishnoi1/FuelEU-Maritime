import React from 'react';
import { Ship } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 shadow-lg">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-center py-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg">
              <Ship className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">FuelEU Maritime</h1>
              <p className="text-sm text-primary-100">Compliance & Optimization Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
