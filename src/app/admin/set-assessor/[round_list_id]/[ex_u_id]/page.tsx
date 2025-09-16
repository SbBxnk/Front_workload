'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Loader, Trash2, Plus } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import Pagination from '@/components/Pagination'
import SearchFilter from '@/components/SearchFilter'
import type { ExPosition } from '@/Types'
import DeleteModal from './deleteModal'
import CreateModal from './createModal'
import Swal from 'sweetalert2'
import useAuthHeaders from '@/hooks/Header'
import Image from 'next/image'

interface Assessor {
  set_asses_list_id: number
  set_asses_info_id: number
  ex_u_id: number
  prefix_name: string
  u_fname: string
  u_img: string
  u_lname: string
  u_id_card: number
  ex_position_name: string
}

const ITEMS_PER_PAGE = 10

export default function AsDetailsPage() {
  const params = useParams()
  const headers = useAuthHeaders()
  const searchParams = useSearchParams()
  const round_list_id = Number(params.round_list_id)
  const set_asses_list_id = params.set_asses_list_id
    ? Number(params.set_asses_list_id)
    : params.ex_u_id
      ? Number(params.ex_u_id)
      : 0

  const examinerPrefix = searchParams.get('prefix') || ''
  const examinerFname = searchParams.get('fname') || ''
  const examinerLname = searchParams.get('lname') || ''

  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [expositons, setExPosition] = useState<ExPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchName, setSearchName] = useState<string>('')
  const [selectedAssessor, setSelectedAssessor] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSetAssesInfoId, setSelectedSetAssesInfoId] =
    useState<number>(0)
  const [FormData, setFormData] = useState({
    ex_u_id: 0,
    set_asses_list_id: set_asses_list_id,
  })

  const fetchAssessorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const resExposition = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/ex_position`,
        { headers }
      )
      if (resExposition.data.data) {
        setExPosition(resExposition.data.data)
      }
      try {
        const resAssesDetail = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/set_assessor_info/${set_asses_list_id}`,
          {
            headers,
          }
        )
        const data = resAssesDetail.data

        if (data && data.data) {
          setAssessors(data.data)
        } else if (Array.isArray(data)) {
          setAssessors(data)
        } else {
          console.log('No assessor data structure found, setting empty array')
          setAssessors([])
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log('No assessor data found (404), setting empty array')
        } else {
          console.error('Error fetching assessor data:', error)
        }
        setAssessors([])
      }
    } catch (error) {
      console.error('Error in fetchAssessorData:', error)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')

      if (!expositons.length) {
        setExPosition([])
      }

      setAssessors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (set_asses_list_id) {
      fetchAssessorData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set_asses_list_id])

  const clearSearch = () => {
    setSearchName('')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleAssessorSelect = (value: string) => {
    setSelectedAssessor(value)
  }

  const filteredAssessors = assessors.filter((assessor) => {
    const assessorName =
      assessor.prefix_name.toString().toLowerCase() +
      assessor.u_fname.toString().toLowerCase() +
      assessor.u_lname.toString().toLowerCase()
    return (
      assessorName.includes(searchName.toLowerCase()) &&
      (selectedAssessor
        ? assessor.ex_position_name.toString() === selectedAssessor
        : true)
    )
  })

  const totalPages = Math.ceil(filteredAssessors.length / ITEMS_PER_PAGE)
  const currentData = filteredAssessors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const assessorOptions = expositons.map((expositon) => ({
    ex_position_name: expositon.ex_position_name,
    label: `${expositon.ex_position_name}`,
  }))

  const selectedLabel = selectedAssessor
    ? `ผู้ตรวจประเมิน ${selectedAssessor}`
    : 'เลือกผู้ตรวจประเมิน'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()

    try {
      const dataToSubmit = {
        set_asses_list_id: Number(FormData.set_asses_list_id),
        ex_u_id: Number(FormData.ex_u_id),
      }

      if (!dataToSubmit.ex_u_id) {
        alert('กรุณาเลือกผู้ตรวจประเมิน')
        setLoading(false)
        return
      }

      // เพิ่มผู้ตรวจประเมิน
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_info/add`,
        dataToSubmit,
        {
          headers,
        }
      )

      setFormData({
        set_asses_list_id: set_asses_list_id,
        ex_u_id: 0,
      })
      fetchAssessorData()

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `เพิ่มผู้ตรวจประเมิน สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      setLoading(false)
      console.error('Error in handleSubmit:', error)

      if (axios.isAxiosError(error)) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการเพิ่มผู้ตรวจประเมิน',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_info_id: number
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_info/delete/${set_asses_info_id}`,
        { headers }
      )
      fetchAssessorData()

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบสาขาผู้ตรวจประเมินสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting assessor:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบผู้ตรวจประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาชื่อผู้ตรวจประเมิน"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            {searchName && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchFilter
            selectedLabel={selectedLabel}
            handleSelect={handleAssessorSelect}
            objects={assessorOptions}
            valueKey="ex_position_name"
            labelKey="label"
            placeholder="ค้นหาตำแหน่งบริหาร"
          />
        </div>
        <div className="w-full pt-4 md:w-auto md:pt-0">
          <label
            htmlFor="modal-create"
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
          >
            เพิ่มผู้ตรวจประเมิน
            <Plus className="h-4 w-4" />
          </label>
        </div>
      </div>
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">
          รายชื่อผู้ตรวจประเมินภาระงานของ{' '}
          <span className="text-business1">
            {examinerPrefix}
            {examinerFname} {examinerLname}
          </span>{' '}
        </h1>
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-gray-600" />
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="rounded-md border transition-all duration-300 ease-in-out dark:border-zinc-600">
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full overflow-x-auto md:table-auto">
                <thead className="bg-gray-100 transition-all duration-300 ease-in-out dark:bg-zinc-800">
                  <tr>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      #
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      รูปภาพ
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      ชื่อผู้ตรวจประเมิน
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      ตำแหน่งบริหาร
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      รหัสผู้ตรวจประเมิน
                    </td>
                    <td className="sticky right-0 text-nowrap border border-gray-300 border-opacity-40 bg-gray-100 p-4 py-4 text-center text-sm text-gray-600 transition-all duration-300 ease-in-out dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300">
                      จัดการ
                    </td>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
                  {currentData.length > 0 ? (
                    currentData.map((assessor, index) => (
                      <tr
                        key={assessor.set_asses_info_id}
                        className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <td className="text-md font-regular whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-center text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 border-opacity-40 dark:border-zinc-600">
                          <div className="flex justify-center">
                            <Image
                              src={`/images/${assessor?.u_img || 'default.png'}`}
                              alt="User Image"
                              width={40}
                              height={40}
                              className="rounded-full border-2 object-cover"
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          </div>
                        </td>
                        <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-left font-light text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                          {assessor.prefix_name}
                          {assessor.u_fname} {assessor.u_lname}
                        </td>
                        <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-left font-light text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                          {assessor.ex_position_name}
                        </td>
                        <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-left font-light text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                          {assessor.u_id_card}
                        </td>

                        <td className="text-md sticky right-0 flex justify-center gap-2 whitespace-nowrap border border-gray-300 border-opacity-40 bg-white p-4 text-center font-light transition-all duration-300 ease-in-out dark:border-zinc-600 dark:bg-zinc-900">
                          <label
                            htmlFor={`modal-delete${assessor.set_asses_info_id}`}
                            className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                            onClick={() => {
                              setSelectedSetAssesInfoId(
                                assessor.set_asses_info_id
                              )
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </label>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-md p-4 text-center font-light text-gray-500 dark:text-gray-400"
                      >
                        ไม่พบข้อมูลผู้ประเมิน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="px-4">
            <Pagination
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              data={filteredAssessors}
              currentData={currentData}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          <CreateModal
            isLoading={loading}
            handleSubmit={handleSubmit}
            formData={FormData}
            setFormData={setFormData}
            expositons={expositons}
            round_list_id={round_list_id}
          />
          <DeleteModal
            isLoading={loading}
            set_asses_info_id={selectedSetAssesInfoId}
            handleDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
