import { useAssessorContext } from '@/provider/AssessorProvider'

/**
 * Hook สำหรับจัดการข้อมูล assessor
 * ใช้ global context เพื่อป้องกันการเรียก API ซ้ำ
 */
export const useAssessor = () => {
  return useAssessorContext()
}

export default useAssessor
