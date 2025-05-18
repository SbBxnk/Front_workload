"use client";
import React from "react";
import { useRouter } from "next/navigation";
import TableCard from "./components/TablePostcard";
import ProfileCard from "./components/ProfileCard";
import CountMemberCard from "./components/CountMemberCard";
import LoginChart from "./components/MemberLoginChart";

export default function MemberLoginChart() {

  const router = useRouter();
  const navigateToTopicPost = () => {
    router.push('/admin/topicpost');
  };

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row w-full gap-4">
        <div className="flex flex-col w-full gap-4">
          <CountMemberCard />
          <div className="min-w-full flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg shadow dark:bg-zinc-900 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 cursor-pointer" onClick={navigateToTopicPost}>
                  อนุมัติหลักฐานภาระงาน
                </h2>
              </div>
              <TableCard />
            </div>
            <div className="bg-white p-4 rounded-lg shadow dark:bg-zinc-900 transition-all duration-300 ease-in-out">
              <LoginChart />
            </div>
          </div>
        </div>
        <ProfileCard />
      </div>
    </>
  );
}

