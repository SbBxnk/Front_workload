import React from 'react';

interface TabItem {
  name: string;
  label: string;
  content: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  onTabSelect?: (tabName: string) => void;
  selectedTab: string;
}

const Tab: React.FC<TabProps> = ({ tabs, onTabSelect, selectedTab }) => {
  const handleTabClick = (tab: TabItem) => {
    if (onTabSelect) {
      onTabSelect(tab.name);
    }
  };

  return (
    <div className="w-full">

      <div className="flex space-x-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`py-2 px-4 text-xs md:text-sm font-regular ${selectedTab === tab.name
                ? 'text-business1 border-b-2 border-business1  dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-600 hover:text-business1 dark:text-blue-500'
              }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <hr className='dark:border-zinc-700 transition-all duration-300 ease-in-out'></hr>
      
      <div className="">
        {tabs
          .filter((tab) => tab.name === selectedTab)
          .map((tab) => (
            <div key={tab.name} className="text-gray-700">
              {tab.content}
            </div>
          ))}
      </div>

    </div>
  );
};

export default Tab;
