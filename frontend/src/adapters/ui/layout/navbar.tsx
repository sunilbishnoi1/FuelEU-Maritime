import React from 'react';
import { Tabs, Tab } from '@heroui/react';
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

  const handleSelectionChange = (key: React.Key) => {
    const selectedItem = navItems.find(item => item.id === key);
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  return (
    <nav className="bg-white p-4 shadow-md">
      <div className="container mx-auto flex w-full flex-col items-center">
        <Tabs
          aria-label="Navigation tabs"
          items={navItems}
          selectedKey={selectedTab}
          onSelectionChange={handleSelectionChange}
          classNames={{
            tabList: "gap-4 w-full relative rounded-xl p-1 bg-gray-100 text-gray-800",
            cursor: "w-full bg-blue-500 rounded-xl",
            tab: "max-w-fit px-4 h-8 text-gray-700",
            tabContent: "group-data-[selected=true]:text-white group-data-[selected=false]:text-gray-600",
          }}
        >
          {(item: NavItem) => (
            <Tab key={item.id} title={item.label} />
          )}
        </Tabs>
      </div>
    </nav>
  );
};

export default Navbar;
