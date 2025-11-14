import React from 'react';
import Header from './header';
import Navbar from './navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navbar />
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
