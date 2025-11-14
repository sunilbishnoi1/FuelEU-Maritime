import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-6 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">FuelEU Maritime</h1>
          <p className="text-sm text-slate-600 mt-1">Compliance & Optimization Platform</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
