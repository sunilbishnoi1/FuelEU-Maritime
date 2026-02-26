import React from 'react';
import Header from './header';
import Navbar from './navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <Navbar />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1400px]">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
