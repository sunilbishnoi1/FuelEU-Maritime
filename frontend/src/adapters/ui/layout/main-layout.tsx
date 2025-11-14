import React from 'react';
import Header from './header';
import Navbar from './navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen center-items">
      <Header />
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
