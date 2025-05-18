"use client"
import axios from "axios"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import type { Terms, WorkloadGroup } from "@/Types"
import useAuthHeaders from "@/hooks/Header"
import { jwtDecode } from "jwt-decode"
import {
  Loader,
  CalendarClock,
  Book,
  Calendar,
  Tag,
  ClockIcon as ClockAlert,
  TriangleAlertIcon,
  AlertCircle,
} from "lucide-react"
import ConfirmModal from "./confirmModal"
import InfoHoverModal from "./infoTermModal"

interface Round {
  round_list_id: number
  round_list_name: string
  year: number
  round: number
  date_start: string
  date_end: string
}

interface Assessor {
  as_id: number
  as_u_id: number
  as_round_list_id: number
  as_status: string
  ex_u_id: number
  ex_u_fname: string
  ex_u_lname: string
}

interface DecodedToken {
  id: number
}

interface CheckWorkloadGroupResponse {
  workload_group_id: number | null
  workload_group_name: string | null
}

const formatThaiDate = (dateString: string) => {
  const date = new Date(dateString)
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]

  const day = date.getDate()
  const month = thaiMonths[date.getMonth()]
  const year = date.getFullYear() + 543

  return `${day} ${month} ${year}`
}

function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [, setSelectedGroup] = useState<string | null>(null)
  const [terms, setTerms] = useState<Terms[]>([])
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUserAssessor, setIsUserAssessor] = useState(false)
  const [workloadGroupInfo, setWorkloadGroupInfo] = useState<CheckWorkloadGroupResponse | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const headers = useAuthHeaders()
  const [selectedWorkloadGroup, setSelectedWorkloadGroup] = useState<WorkloadGroup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const infoIconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        setUserId(decoded.id)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [])

  useEffect(() => {
    const checkWorkloadGroup = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_form/check_workload_group/${userId}`,
            { headers },
          )
          setWorkloadGroupInfo(response.data.data[0] || null)
          console.log(response.data.data[0].formlist_id)
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setWorkloadGroupInfo(null)
          } else {
            console.error("Error checking workload group:", error)
          }
        }
      }
    }

    checkWorkloadGroup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const responseTerms = await axios.get(`${process.env.NEXT_PUBLIC_API}/workload_form/terms`, { headers })
        const responseWorkloadGroups = await axios.get(`${process.env.NEXT_PUBLIC_API}/workload_group`, { headers })
        const responseRounds = await axios.get(`${process.env.NEXT_PUBLIC_API}/set_assessor_round`, { headers })

        setWorkloadGroups(responseWorkloadGroups.data.data)
        setTerms(responseTerms.data.data)

        const fetchedRounds = responseRounds.data.data || []
        setRounds(fetchedRounds)

        const currentDate = new Date()
        const activeRound = fetchedRounds.find((round: Round) => {
          const startDate = new Date(round.date_start)
          const endDate = new Date(round.date_end)
          return currentDate >= startDate && currentDate <= endDate
        })

        setCurrentRound(activeRound || null)

        if (activeRound && userId) {
          try {
            const assessorResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API}/set_assessor/${activeRound.round_list_id}`,
              { headers },
            )
            console.log(activeRound.round_list_id)
            const assessorData = assessorResponse.data.data || []

            // หาผู้ประเมินที่มีสิทธิ์ในรอบปัจจุบัน โดยจะต้องมีผู้ตรวจอย่างน้อย 1 คนถึงจะสามารถประเมินได้
            const isAssessor = assessorData.some((assessor: Assessor) => assessor.as_u_id === userId)
            setIsUserAssessor(isAssessor)
          } catch (error) {
            console.error("Error fetching assessor data:", error)
          }
        } else {
          console.log("ไม่พบรอบการประเมินที่ตรงกับวันที่ปัจจุบัน")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ดึงรายการภาระงานที่ไม่ซ้ำกันจากข้อมูล API
  const uniqueTasks = Array.isArray(terms) ? [...new Set(terms.map((term) => term.task_name))] : []

  // ดึงกลุ่มงานที่ไม่ซ้ำกันจากข้อมูล API
  const uniqueGroups = Array.isArray(terms) ? [...new Set(terms.map((term) => term.workload_group_name))] : []

  // ฟังก์ชันหาจำนวนชั่วโมงตามภาระงานและกลุ่มงาน
  const getWorkloadHours = (taskName: string, groupName: string) => {
    if (!Array.isArray(terms)) return 0

    const item = terms.find((term) => term.task_name === taskName && term.workload_group_name === groupName)
    return item ? item.quantity_workload_hours : 0
  }

  // คำนวณผลรวมของแต่ละกลุ่ม
  const calculateGroupTotal = (groupName: string) => {
    if (!Array.isArray(terms)) return 0

    let total = 0
    uniqueTasks.forEach((taskName) => {
      total += getWorkloadHours(taskName, groupName)
    })
    return total
  }

  const handleSelectWorkloadGroup = async (workload_group: WorkloadGroup) => {
    if (!userId || !currentRound) {
      console.error("Missing userId or currentRound")
      alert("ไม่สามารถเลือกกลุ่มภาระงานได้ กรุณาลองใหม่")
      return
    }

    const payload = {
      workload_group_id: workload_group.workload_group_id,
      round_id: currentRound.round_list_id,
    }

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API}/workload_form/update/${userId}`, payload, {
        headers,
      })

      if (response.data.status) {
        // อัปเดต workloadGroupInfo และ selectedGroup
        setWorkloadGroupInfo({
          workload_group_id: workload_group.workload_group_id,
          workload_group_name: workload_group.workload_group_name,
        })
        setSelectedGroup(workload_group.workload_group_name)
      } else {
        console.error("Error from API:", response.data.error)
      }
    } catch (error) {
      console.error("Error updating workload group:", error)
    }
  }

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoIconRef.current && !infoIconRef.current.contains(event.target as Node)) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [infoIconRef])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100 rounded-md">
        <div className="flex justify-center items-center space-x-4">
          <Loader className="animate-spin text-primary h-12 w-12 font-semibold" />
          <p className="text-4xl font-regular text-primary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ไม่มีรอบการประเมิน */}
      {!currentRound ? (
        <div className="bg-white p-6 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 mb-4">
          <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
            <ClockAlert className="text-blue-500 h-12 w-12 md:h-24 md:w-24" />
            <div className="">
              <h2 className="text-4xl font-medium text-gray-700 dark:text-gray-300 mb-2">ยังไม่มีรอบการประเมิน</h2>
              <p className="text-gray-500 dark:text-gray-400">
                ไม่พบรอบการประเมินที่ตรงกับวันที่ปัจจุบัน กรุณาตรวจสอบอีกครั้งในภายหลัง
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* รอบปัจจุบัน - แสดงเฉพาะเมื่อมีสิทธิในการประเมิน */}
          {isUserAssessor && (
            <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 mb-4">
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">รอบการประเมินปัจจุบัน</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="">
                  <p className="flex font-light items-center text-gray-500 gap-2 text-sm">
                    <Tag className="w-4 h-4" />
                    ชื่อรอบการประเมิน
                  </p>
                  <p className=" text-md font-normal text-md p-2">{currentRound.round_list_name}</p>
                </div>
                <div className="">
                  <p className="flex font-light items-center text-gray-500 gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    รอบ / ปีงบประมาณ
                  </p>
                  <p className=" text-md font-normal text-md p-2">
                    {currentRound.round} / {currentRound.year}
                  </p>
                </div>
                <div className="">
                  <p className="flex font-light items-center text-gray-500 gap-2 text-sm">
                    <CalendarClock className="w-4 h-4" />
                    ระยะเวลา
                  </p>
                  <p className=" text-md font-normal text-md p-2">
                    {formatThaiDate(currentRound.date_start)} - {formatThaiDate(currentRound.date_end)}
                  </p>
                </div>
                <div className="">
                  <p className="flex font-light items-center text-gray-500 gap-2 text-sm">
                    <Book className="w-4 h-4" />
                    กลุ่มภาระงาน
                  </p>
                  <div className="text-md font-normal text-md p-2 flex items-center gap-2 relative">
                    {workloadGroupInfo?.workload_group_name || "-"}
                    {/* หากไม่มีการเลือก workload_group_id จะไม่แสดง info */}
                    {workloadGroupInfo?.workload_group_id && (
                      <div
                        ref={infoIconRef}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer "
                        onMouseEnter={() => setIsModalOpen(true)}
                        onMouseLeave={() => setIsModalOpen(false)}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {isModalOpen && <InfoHoverModal workloadGroupInfo={workloadGroupInfo} isOpen={isModalOpen} />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เลือกกลุ่มภาระงาน - แสดงเฉพาะเมื่อเป็นผู้ประเมิน */}
          {isUserAssessor ? (
            !workloadGroupInfo ||
            workloadGroupInfo.workload_group_id === 0 ||
            workloadGroupInfo.workload_group_id === null ? (
              <div className="space-y-4">
                {Array.isArray(terms) && terms.length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
                    <h2 className="text-gray-700 text-lg font-medium">เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน</h2>
                    <div className="overflow-x-auto my-4">
                      <table className="w-full overflow-x-auto md:table-auto bg-white border border-gray-300 dark:bg-zinc-900 dark:border-gray-700">
                        <thead className="bg-gray-100 dark:bg-zinc-800">
                          <tr>
                            <th className="py-3 px-4 border-b border-r border-gray-300 text-left text-gray-700 dark:text-gray-300"></th>
                            {uniqueGroups.map((group, index) => (
                              <th
                                key={index}
                                className="py-2 px-4 border-b border-r border-gray-300 text-center font-normal text-gray-600 dark:text-gray-300 text-md text-nowrap"
                              >
                                {group}
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-nowrap">
                                  (ภาระงานต่อสัปดาห์)
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueTasks.map((taskName, taskIndex) => (
                            <tr key={taskIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                              <td className="py-2 px-4 border-b border-r border-gray-300 font-normal text-md text-gray-700 text-nowrap">
                                {taskIndex + 1}. {taskName}
                              </td>
                              {uniqueGroups.map((group, groupIndex) => (
                                <td
                                  key={groupIndex}
                                  className="py-2 px-4 border-b border-r border-gray-300 text-center text-gray-500 "
                                >
                                  {getWorkloadHours(taskName, group)}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="bg-gray-100 dark:bg-zinc-800 font-bold">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-normal text-center text-gray-600">
                              ผลรวม (ไม่น้อยกว่า)
                            </td>
                            {uniqueGroups.map((group, groupIndex) => (
                              <td
                                key={groupIndex}
                                className="py-2 px-4 border-b border-r border-gray-300 text-center text-business1 font-normal"
                              >
                                {calculateGroupTotal(group)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
                  <h2 className="text-gray-700 text-lg font-medium">กรุณาเลือกภาระงานก่อน:</h2>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {workloadGroups.map((group: WorkloadGroup) => (
                      <label
                        key={group.workload_group_id}
                        htmlFor={`confirm-modal`}
                        onClick={() => setSelectedWorkloadGroup(group)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ease-in-out duration-300 cursor-pointer"
                      >
                        {group.workload_group_name}
                      </label>
                    ))}
                  </div>
                  <ConfirmModal
                    handleSelectWorkloadGroup={handleSelectWorkloadGroup}
                    workload_group={selectedWorkloadGroup}
                  />
                </div>
              </div>
            ) : (
              <div>{children}</div>
            )
          ) : (
            <div className="bg-white p-6 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 mb-4">
              <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                <TriangleAlertIcon className="text-red-500 h-12 w-12 md:h-24 md:w-24" />
                <div className="">
                  <h2 className="text-4xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ไม่พบสิทธิในการประเมินภาระงาน
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้ กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ClientLayout
