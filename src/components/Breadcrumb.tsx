"use client"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

interface MainTaskDetail {
  task_name: string
  task_id: number
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const params = useParams()
  const task_id = params.task_id // รับ task_id จาก URL
  const round_list_id = params.round_list_id // รับ round_list_id จาก URL
  const ex_u_id = params.ex_u_id // รับ ex_u_id จาก URL
  const segments = pathname.split("/").filter(Boolean)
  const [taskName, setTaskName] = useState<MainTaskDetail>({ task_id: 0, task_name: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTaskName = async () => {
      if (!task_id) {
        console.log('Task ID is not available')
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get<{ data: MainTaskDetail }>(`${process.env.NEXT_PUBLIC_API}/maintask/${task_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        console.log('API response:', response) // ตรวจสอบข้อมูลจาก API
        if (response.data && response.data.data.task_name) {
          setTaskName(response.data.data)
        } else {
          setTaskName({ task_id: 0, task_name: "ไม่พบข้อมูล" })
        }
      } catch (error) {
        console.error("Error fetching task name:", error)
        setTaskName({ task_id: 0, task_name: "ไม่สามารถโหลดข้อมูลได้" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskName()
  }, [task_id])

  const staticBreadcrumbPath: Record<string, string> = {
    // ผู้ดูแลระบบ
    "/admin": "หน้าหลัก",
    "/admin/profile": "ข้อมูลส่วนตัว",
    "/admin/member": "สมาชิก",
    "/admin/settings": "การตั้งค่า",
    "/admin/topicpost": "จัดการไฟล์หลักฐานภาระงาน",
    "/admin/personal-list": "บุคลากร",
    "/admin/personal-list/create-personal": "เพิ่มบุคลากร",
    "/admin/prefix": "คำนำหน้า",
    "/admin/position": "ตำแหน่งวิชาการ",
    "/admin/exposition": "ตำแหน่งบริการ",
    "/admin/brnach": "สาขา",
    "/admin/course": "หลักสูตร",
    "/admin/round": "รอบการประเมิน",
    "/admin/personal-type": "ประเภทผู้ใชงาน",
    "/admin/user-level": "ระดับผู้ใช้งาน",
    "/admin/set-assessor": "รอบประเมินภาระงาน",

    // ผู้ประเมิน
    "/user": "หน้าหลัก",
    "/user/profile": "ข้อมูลส่วนตัว",
    "/user/workload_form": "แบบฟอร์มภาระงาน",
  }

  let breadcrumbItems = [];
  
  if (pathname.match(new RegExp(`^/admin/set-assessor/${round_list_id}/${ex_u_id}$`))) {
    breadcrumbItems = [
      { path: "/admin", label: "หน้าหลัก" },
      { path: "/admin/set-assessor", label: "รอบประเมินภาระงาน" },
      { path: `/admin/set-assessor/${round_list_id}`, label: "ผู้ประเมินภาระงาน" },
      { path: `/admin/set-assessor/${round_list_id}/${ex_u_id}`, label: "ผู้ตรวจประเมินภาระงาน" }
    ];
  } else if (pathname.match(new RegExp(`^/admin/set-assessor/${round_list_id}$`))) {
    breadcrumbItems = [
      { path: "/admin", label: "หน้าหลัก" },
      { path: "/admin/set-assessor", label: "รอบประเมินภาระงาน" },
      { path: `/admin/set-assessor/${round_list_id}`, label: "ผู้ประเมินภาระงาน" }
    ];
  } else {
    breadcrumbItems = segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;

      if (path.match(/^\/user\/workload_form\/\d+$/)) {
        return {
          path,
          label: isLoading ? "กำลังโหลด..." : taskName.task_name || "ไม่พบข้อมูล",
        };
      }

      const label = staticBreadcrumbPath[path] || segment;
      return { path, label };
    });
  }

  return (
    <div className="breadcrumbs p-0 text-sm dark:text-gray-200 truncate">
      <ul>
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-block">
            {index < breadcrumbItems.length - 1 ? (
              <Link href={item.path}>
                <p className="text-gray-600 dark:text-gray-400 hover:underline">{item.label}</p>
              </Link>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{item.label}</p>
            )}
            {index < breadcrumbItems.length - 1 && (
              <span className="text-gray-400"></span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

