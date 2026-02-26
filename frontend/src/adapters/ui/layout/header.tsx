import React from 'react';
import { Ship } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-[1400px]">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-md border border-blue-500/30">
              <Ship className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FuelEU Maritime
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Platform</span>
              </h1>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400 hidden sm:block">
            Compliance & Optimization
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
