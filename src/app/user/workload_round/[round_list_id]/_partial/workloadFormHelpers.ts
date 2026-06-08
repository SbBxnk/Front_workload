import type { Task } from '../types'

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
export const isImageFile = (fileName: string | null | undefined): boolean => {
  if (!fileName) return false

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}

// ตำแหน่งที่ใช้ในระบบ
export const POSITIONS = [
  { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
  { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
  { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
  { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
]

// แปลง snapshot payload เป็นโครงสร้าง Task[]
// จัดกลุ่มข้อมูลตาม task_id และ subtask_id
export const convertSnapshotPayloadToTasks = (payload: any[]): Task[] => {
  const taskMap = new Map()

  payload.forEach((item: any) => {
    const taskId = item.task_id || 1
    const subtaskId = item.subtask_id || 1

    if (!taskMap.has(taskId)) {
      taskMap.set(taskId, {
        task_id: taskId,
        task_name: item.task_name || 'ภาระงานสอน',
        workload_group_id: item.workload_group_id,
        workload_group_name: item.workload_group_name,
        quantity_workload_hours: item.quantity_workload_hours,
        subtasks: new Map(),
      })
    }

    const task = taskMap.get(taskId)

    if (!task.subtasks.has(subtaskId)) {
      task.subtasks.set(subtaskId, {
        subtask_id: subtaskId,
        subtask_name: item.subtask_name || 'ภาระงานเกณฑ์การคิดภาระงานสอนชั่วโมงทฤษฎี',
        form_infos: [],
      })
    }

    const subtask = task.subtasks.get(subtaskId)
    // แปลงข้อมูล files และ links รองรับทั้งแบบ array และแบบ string (GROUP_CONCAT)
    const files = Array.isArray(item.files)
      ? item.files.map((f: any) => ({ file_name: (f.file_name || '').trim() }))
      : (typeof item.files === 'string' && item.files.length > 0
        ? (item.files as string).split(', ').map((f: string) => ({ file_name: f.trim() }))
        : [])
    const links = Array.isArray(item.links)
      ? item.links.map((l: any) => ({ link_name: l.link_name || '', link_path: l.link_path || '' }))
      : (typeof item.links === 'string' && item.links.length > 0
        ? (item.links as string).split(', ').map((l: string) => {
          const parts = l.split('|')
          return {
            link_name: parts[0] || '',
            link_path: parts[1] || parts[0] || '',
          }
        })
        : [])

    subtask.form_infos.push({
      form_id: item.form_id,
      form_title: item.form_title,
      description: item.description,
      workload: item.workload,
      quality: item.quality,
      file_type: item.file_type,
      ex_score: item.ex_score,
      files: files,
      links: links,
      evaluation_score: item.evaluation_score != null ? Number(item.evaluation_score) : null,
    })
  })

  // แปลง Map เป็น Array
  const convertedData: Task[] = Array.from(taskMap.values()).map(task => ({
    ...task,
    subtasks: Object.fromEntries(task.subtasks),
  }))

  return convertedData
}

// ข้อมูล mock สำรองกรณีดึง API ไม่ได้
export const getMockWorkloadData = (): Task[] => ([
  {
    task_id: 1,
    task_name: 'ภาระงานสอน',
    subtasks: {
      1: {
        subtask_id: 1,
        subtask_name: 'ภาระงานเกณฑ์การคิดภาระงานสอนชั่วโมงทฤษฎี',
        form_infos: [
          {
            form_id: 1,
            form_title: 'ภาระงานสอนชั่วโมงทฤษฎี 1/2567',
            description: 'จำนวน 12 ชม/สัปดาห์',
            workload: 2,
            quality: 6,
            file_type: 'external file',
            ex_score: 0,
          },
        ],
      },
    },
  },
])
