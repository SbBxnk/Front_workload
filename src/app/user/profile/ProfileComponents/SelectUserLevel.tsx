import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
interface SelectedUserLevelProps {
  level_id: number;
  level_name: string;
  userLevelDropdownRef: React.RefObject<HTMLDivElement>;
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  openDropdown: string | null
  handleOnChangeUserLevel: (level_id: number, level_name: string) => void
  setSelectedLevel: React.Dispatch<React.SetStateAction<string | null>>
  selectLevel: string | null
}

function SelectedUserLevel({ userLevelDropdownRef, setOpenDropdown, openDropdown, handleOnChangeUserLevel, setSelectedLevel, selectLevel }: SelectedUserLevelProps) {
  const [userLevels, setUserLevels] = useState<SelectedUserLevelProps[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserLevels = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.get(process.env.NEXT_PUBLIC_API + "level", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          if (response.data.status) {
            setUserLevels(response.data.data); // Set user levels from API
          } else {
            throw new Error("No data found");
          }
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching levels");
          console.error("Axios error:", error.response || error.message);
        } else {
          setError("An unknown error occurred");
          console.error("Unknown error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevels();
  }, []);

  const handleSelectLevel = (level_id: number, level_name: string) => {
    setSelectedLevel(level_name);
    handleOnChangeUserLevel(level_id, level_name);
    setOpenDropdown(null);
  };

  return (
    <div>
      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
        ระดับผู้ใช้งาน
      </label>
      <div className="relative z-5" ref={userLevelDropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
          className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out">
          {selectLevel === null
            ? "เลือกระดับ"
            : userLevels.find(level => level.level_name === selectLevel)?.level_name
          }
          <ChevronDown
            className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'level' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'level' && (
          <div
            className="absolute z-10 overflow-y-auto h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg"
          >
            {userLevels.map((level) => (
              <div
                key={level.level_id}
                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                onClick={() => handleSelectLevel(level.level_id, level.level_name)}
              >
                {level.level_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}

export default SelectedUserLevel;
