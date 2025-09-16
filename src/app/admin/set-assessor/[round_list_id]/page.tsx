'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader, Trash2, Eye, Plus } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import Pagination from '@/components/Pagination'
import SearchFilter from '@/components/SearchFilter'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import useAuthHeaders from '@/hooks/Header'
import type { ExPosition, User } from '@/Types'
import Swal from 'sweetalert2'
import Image from 'next/image'

interface Assessor {
  set_asses_list_id: number
  round_list_id: number
  as_u_id: number
  prefix_name: string
  u_fname: string
  u_lname: string
  ex_position_name: string
  u_id_card: string
  u_img: string
  workload_group_id: number
  workload_group_name: number
}

interface Round {
  round_list_id: number
  round_list_name: string
  round: number
  year: string
}

interface Delete {
  set_asses_list_id: number[]
}

interface WorkloadFormList {
  set_asses_list_id: number
  status_id: number
}

const ITEMS_PER_PAGE = 10

export default function ExDetailsPage() {
  const headers = useAuthHeaders()
  const params = useParams()
  const router = useRouter()
  const round_list_id = params.round_list_id
  const [FormData, setFormData] = useState({ round_list_id: 0, as_u_id: 0 })
  const [rounds, setRound] = useState<Round>()
  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [expositons, setExPosition] = useState<ExPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchName, setSearchName] = useState<string>('')
  const [selectedAssessor, setSelectedAssessor] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSetAssesListId, setSelectedSetAssesListId] =
    useState<number>(0)
  const [selectedSetAsFname, setSelectedSetAsFname] = useState<string>('')
  const [selectedSetAsLname, setSelectedSetAsLname] = useState<string>('')
  const [selectedSetAsPrefixname, setSelectedSetAsPrefixname] =
    useState<string>('')
  const [checkDelete, setCheckDelete] = useState<Delete>({
    set_asses_list_id: [],
  })
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [users, setUsers] = useState<User[]>([])
  const [allUsersAdded, setAllUsersAdded] = useState<boolean>(false)

  const fetchUsers = async () => {
    try {
      const resUsers = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/as_user/${round_list_id}`,
        {
          headers,
        }
      )
      if (resUsers.data.data) {
        const processedUsers = resUsers.data.data
        setUsers(processedUsers)

        const assessorUserIds = assessors.map((assessor) => assessor.as_u_id)
        const allAdded = processedUsers.every((user: User) =>
          assessorUserIds.includes(user.u_id)
        )
        setAllUsersAdded(allAdded)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers()
    } else {
      const assessorUserIds = assessors.map((assessor) => assessor.as_u_id)
      const allAdded = users.every((user: User) =>
        assessorUserIds.includes(user.u_id)
      )
      setAllUsersAdded(allAdded)
    }
    // eslint-disable-next-line
  }, [assessors, users, round_list_id])

  const fetchAssessorData = async () => {
    try {
      setLoading(true)
      setError(null)
      setAssessors([])

      setFormData((prev) => ({ ...prev, round_list_id: Number(round_list_id) }))

      const resExposition = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/ex_position`,
        { headers }
      )
      if (resExposition.data.data) {
        setExPosition(resExposition.data.data)
      }

      const resRoundTitle = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_round/${round_list_id}`,
        {
          headers,
        }
      )
      if (resRoundTitle.data.data) {
        setRound(resRoundTitle.data.data)
      }

      try {
        const resAssesDetail = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/set_assessor_list/${round_list_id}`,
          {
            headers,
          }
        )
        if (resAssesDetail.data.status && resAssesDetail.data.data.length > 0) {
          const assessorsData = resAssesDetail.data.data
          setAssessors(assessorsData)

          const idsWithData: number[] = []
          for (const assessor of assessorsData) {
            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/set_assessor_info/${assessor.set_asses_list_id}`,
                {
                  headers,
                }
              )
              if (
                response.data.status &&
                response.data.data &&
                response.data.data.length > 0
              ) {
                idsWithData.push(assessor.set_asses_list_id)
              }
            } catch (error) {
              if (
                !(axios.isAxiosError(error) && error.response?.status === 404)
              ) {
                console.error(
                  `Error checking data for assessor ${assessor.set_asses_list_id}:`,
                  error
                )
              }
            }
          }
          setCheckDelete({ set_asses_list_id: idsWithData })
        } else {
          setAssessors([])
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setAssessors([])
        } else {
          if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
            console.error('Error fetching assessor data:', error)
          }
          setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
        }
      }
    } catch (error) {
      if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (round_list_id) {
      fetchAssessorData()
    }
    // eslint-disable-next-line
  }, [round_list_id])

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
      (assessor.prefix_name?.toString() || '').toLowerCase() +
      (assessor.u_fname?.toString() || '').toLowerCase() +
      (assessor.u_lname?.toString() || '').toLowerCase()
    return (
      assessorName.includes(searchName.toLowerCase()) &&
      (selectedAssessor
        ? (assessor.ex_position_name?.toString() || '') === selectedAssessor
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
    ? `ผู้ถูกประเมิน ${selectedAssessor}`
    : 'เลือกผู้ถูกประเมิน'

  const handleSetExUser = (set_asses_list_id: number, assessor: Assessor) => {
    router.push(
      `/admin/set-assessor/${round_list_id}/${set_asses_list_id}?prefix=${encodeURIComponent(assessor.prefix_name)}&fname=${encodeURIComponent(assessor.u_fname)}&lname=${encodeURIComponent(assessor.u_lname)}`
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()

    try {
      const dataToSubmit = {
        round_list_id: Number(FormData.round_list_id),
        as_u_id: Number(FormData.as_u_id),
      }

      if (!dataToSubmit.as_u_id) {
        alert('กรุณาเลือกผู้ถูกประเมิน')
        setLoading(false)
        return
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_list/add`,
        dataToSubmit,
        { headers }
      )

      // Get the latest assessor list to find the maximum set_asses_list_id
      const resAssesDetail = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_list/${round_list_id}`,
        {
          headers,
        }
      )
      const dataAssesDetail = resAssesDetail.data.data
      setAssessors(dataAssesDetail)

      // Find the maximum set_asses_list_id
      const maxIdAssessor = dataAssesDetail.reduce(
        (max: number, assessor: Assessor) =>
          assessor.set_asses_list_id > max ? assessor.set_asses_list_id : max,
        0
      )

      // Add to workload form with the maximum set_asses_list_id
      if (maxIdAssessor > 0) {
        const workloadFormData: WorkloadFormList = {
          set_asses_list_id: maxIdAssessor,
          status_id: 0,
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API}/workload_form/add`,
          workloadFormData,
          { headers }
        )
      }

      setFormData({
        round_list_id: Number(round_list_id),
        as_u_id: 0,
      })

      setLoading(false)

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `เพิ่มผู้ถูกประเมิน สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      setLoading(false)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'ผู้ถูกประเมินนี้ถูกเพิ่มแล้ว!',
            text: 'ผู้ถูกประเมินนี้ถูกเพิ่มในรอบการประเมินแล้ว',
            showConfirmButton: false,
            timer: 1500,
          })
        } else {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'เกิดข้อผิดพลาดในการเพิ่มผู้ถูกประเมิน',
            showConfirmButton: false,
            timer: 1500,
          })
        }
      }
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_list_id: number
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_list/delete/${set_asses_list_id}`,
        { headers }
      )
      fetchAssessorData()
      setRefreshTrigger((prev) => prev + 1)
      setLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบสาขาผู้ถูกประเมินสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch {
      fetchAssessorData()
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบผู้ถูกประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาชื่อผู้ถูกประเมิน"
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
          {users.length > 0 && !allUsersAdded ? (
            <label
              htmlFor="modal-create"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มผู้ถูกประเมิน
              <Plus className="h-4 w-4" />
            </label>
          ) : (
            <div className="pointer-events-none flex w-full cursor-not-allowed items-center justify-between gap-2 rounded-md bg-gray-300 px-4 py-2.5 text-sm font-light text-white md:w-52">
              เพิ่มผู้ถูกประเมิน
              <Plus className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">
          ผู้ถูกประเมิน{' '}
          <span className="text-business1">{rounds?.round_list_name}</span>
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
          <div className="">
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-80">
                <Loader className="h-12 w-12 animate-spin text-gray-600" />
              </div>
            )}
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
                      ชื่อผู้ถูกประเมิน
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      ตำแหน่งบริหาร
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      รหัสผู้ถูกประเมิน
                    </td>
                    <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      กลุ่มภาระงาน
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
                        key={assessor.set_asses_list_id}
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
                        <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-left font-normal text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                          {assessor.workload_group_name ? (
                            <span
                              className={`text-green-500 dark:text-gray-400`}
                            >
                              {assessor.workload_group_name}
                            </span>
                          ) : (
                            <span className="text-red-500 dark:text-gray-400">
                              ยังไม่ได้เลือกกลุ่มภาระงาน
                            </span>
                          )}
                        </td>
                        <td className="text-md sticky right-0 flex justify-center gap-2 whitespace-nowrap border border-gray-300 border-opacity-40 bg-white p-4 text-center font-light transition-all duration-300 ease-in-out dark:border-zinc-600 dark:bg-zinc-900">
                          <button
                            className="cursor-pointer rounded-md border-none border-blue-500 p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
                            onClick={() =>
                              handleSetExUser(
                                assessor.set_asses_list_id,
                                assessor
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!checkDelete.set_asses_list_id.includes(
                            assessor.set_asses_list_id
                          ) ? (
                            <label
                              htmlFor={`modal-delete${assessor.set_asses_list_id}`}
                              className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                              onClick={() => {
                                setSelectedSetAssesListId(
                                  assessor.set_asses_list_id
                                )
                                setSelectedSetAsFname(assessor.u_fname)
                                setSelectedSetAsLname(assessor.u_lname)
                                setSelectedSetAsPrefixname(assessor.prefix_name)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </label>
                          ) : (
                            <button
                              disabled
                              className="cursor-not-allowed rounded-md border-none border-gray-400 p-1 text-gray-300"
                              title="ไม่สามารถลบได้เนื่องจากมีข้อมูลที่เกี่ยวข้อง"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-md p-4 text-center font-light text-gray-500 dark:text-gray-400"
                      >
                        ไม่พบข้อมูลผู้ถูกประเมิน
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
        </div>
      )}

      <CreateModal
        isLoading={loading}
        handleSubmit={handleSubmit}
        formData={FormData}
        setFormData={setFormData}
        expositons={expositons}
        refreshTrigger={refreshTrigger}
      />

      <DeleteModal
        prefix_name={selectedSetAsPrefixname}
        u_fname={selectedSetAsFname}
        u_lname={selectedSetAsLname}
        isLoading={loading}
        set_asses_list_id={selectedSetAssesListId}
        handleDelete={handleDelete}
      />
    </div>
  )
}
