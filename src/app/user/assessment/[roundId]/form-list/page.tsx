'use client'

import { useSession } from 'next-auth/react'
import { useAssessor } from '@/hooks/useAssessor'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Calendar, Building, FileText, Users } from 'lucide-react'
import AssesseeService, { Assessee } from '@/services/assesseeService'
import { jwtDecode } from 'jwt-decode'
import type { DecodedToken } from '@/Types/decodetoken'
import useUtility from '@/hooks/useUtility'

export default function AssessmentRoundPage() {
  const { setBreadcrumbs } = useUtility()
  const { data: session, status } = useSession()
  const { isAssessor, loading } = useAssessor()
  const router = useRouter()
  const params = useParams()
  const roundId = params?.roundId as string

  const [assessees, setAssessees] = useState<Assessee[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roundInfo, setRoundInfo] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (!isAssessor) {
      router.push('/user')
      return
    }

    fetchAssessees()
  }, [status, isAssessor, roundId])

  useEffect(() => {
    setBreadcrumbs(
      [
        { text: 'ตรวจประเมินภาระงาน', path: '/user/assessment' },
        { text: `${roundInfo?.round_list_name}`, path: `/user/assessment/${roundId}` },
      ])
  }, [setBreadcrumbs])
  
  const fetchAssessees = async () => {
    if (!session?.accessToken || !roundId) return

    try {
      setLoadingData(true)
      setError(null)

      const decoded: DecodedToken = jwtDecode(session.accessToken)
      const assesseesData = await AssesseeService.getAssesseesByRound(
        decoded.id,
        parseInt(roundId),
        session.accessToken
      )
      
      setAssessees(assesseesData)
      
      // เก็บข้อมูลรอบการประเมินจากข้อมูลแรก
      if (assesseesData.length > 0) {
        setRoundInfo(assesseesData[0])
      }
    } catch (err) {
      console.error('Error fetching assessees:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoadingData(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-business1"></div>
      </div>
    )
  }

  if (!isAssessor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลการประเมิน</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-business1"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/user/assessment')}
            className="bg-business1 text-white px-4 py-2 rounded-md hover:bg-business1/90 transition-colors"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/user/assessment')}
          className="flex items-center space-x-2 text-business1 hover:text-business1/80 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปหน้ารายการรอบการประเมิน</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {roundInfo ? roundInfo.round_list_name : 'รายการผู้ถูกประเมิน'}
        </h1>
        <p className="text-gray-600">
          {roundInfo && `รอบที่ ${roundInfo.round} ปี ${roundInfo.year}`}
        </p>
      </div>

      {roundInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                ข้อมูลรอบการประเมิน
              </h3>
              <p className="text-blue-700">
                ระยะเวลา: {formatDate(roundInfo.date_start)} - {formatDate(roundInfo.date_end)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {assessees.length}
              </div>
              <div className="text-sm text-blue-700">ผู้ถูกประเมิน</div>
            </div>
          </div>
        </div>
      )}

      {assessees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการผู้ถูกประเมิน</h3>
          <p className="text-gray-500">คุณยังไม่มีผู้ถูกประเมินในรอบนี้</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ถูกประเมิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ตำแหน่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    กลุ่มภาระงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessees.map((assessee) => (
                  <tr key={assessee.set_asses_info_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {assessee.u_img ? (
                          <img
                            src={assessee.u_img}
                            alt={`${assessee.u_fname} ${assessee.u_lname}`}
                            className="w-10 h-10 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assessee.prefix_name} {assessee.u_fname} {assessee.u_lname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assessee.u_id_card}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="h-4 w-4 mr-2" />
                        {assessee.ex_position_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assessee.workload_group_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // TODO: ไปยังหน้าการประเมินจริง
                          alert(`เริ่มประเมิน ${assessee.u_fname} ${assessee.u_lname}`)
                        }}
                        className="bg-business1 text-white px-4 py-2 rounded-md hover:bg-business1/90 transition-colors"
                      >
                        เริ่มประเมิน
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
