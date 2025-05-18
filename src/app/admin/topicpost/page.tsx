"use client";
import React, { useState } from 'react';
import Tabbar from './TopicPostcomponents/Tab';

import TableCard from '../components/TablePostcard'
import Card from './TopicPostcomponents/Card';
const Page: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('หลักฐานภาระงาน');  // ตั้งค่าเริ่มต้นเป็น 'หลักฐานภาระงาน'

  const tabs = [
    {
      name: 'หลักฐานภาระงาน',
      label: 'หลักฐานภาระงาน',
      content: (
        <Card />
      ),

    },
    {
      name: 'อนุมัติหลักฐานภาระงาน',
      label: 'อนุมัติหลักฐานภาระงาน',
      content: (
        <TableCard />
      ),
    }
  ];

  return (
    <div className="w-full m-0 bg-white p-4 rounded-lg h-full shadow dark:bg-zinc-900 transition-all duration-300 ease-in-out">
      <div className="m-0 w-full">
        <Tabbar
          tabs={tabs}
          onTabSelect={setSelectedTab}
          selectedTab={selectedTab}
        />
      </div>
    </div>
  );
};

export default Page;
