import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fuel EU Compliance Dashboard</h1>
        {/* Potentially add user info or other header elements here */}
      </div>
    </header>
  );
};

export default Header;
