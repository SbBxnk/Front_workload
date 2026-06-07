import type { TableColumn } from '@/components/Table'
import { Trash2, Eye, FileCheck, FileX } from 'lucide-react'
import Image from 'next/image'
import type { Assessor, Delete, EvaluationStatus } from './types'

// สไตล์สำหรับสถานะการประเมิน
const statusStyles: { [key: string]: string } = {
  completed: 'text-white bg-green-500',
  in_progress: 'text-white bg-blue-500',
  not_started: 'text-gray-500 bg-gray-200',
}

interface GetAssessorColumnsDeps {
  page: number
  rowsPerPage: number
  evaluationStatuses: Record<number, EvaluationStatus>
  checkboxStates: Record<number, boolean>
  checkDelete: Delete
  handleCheckboxChange: (set_asses_list_id: number, checked: boolean) => void
  handleSetExUser: (set_asses_list_id: number, assessor: Assessor) => void
  setSelectedSetAssesListId: (id: number) => void
  setSelectedSetAsFname: (name: string) => void
  setSelectedSetAsLname: (name: string) => void
  setSelectedSetAsPrefixname: (name: string) => void
}

export function getAssessorColumns({
  page,
  rowsPerPage,
  evaluationStatuses,
  checkboxStates,
  checkDelete,
  handleCheckboxChange,
  handleSetExUser,
  setSelectedSetAssesListId,
  setSelectedSetAsFname,
  setSelectedSetAsLname,
  setSelectedSetAsPrefixname,
}: GetAssessorColumnsDeps): TableColumn<Assessor>[] {
  return [
    {
      key: 'index',
      label: '#',
      width: '80px',
      align: 'center',
      render: (_, __, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {page * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'u_img',
      label: 'รูปภาพ',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center">
          <Image
            src={`/profile/${record?.u_img || 'default.png'}`}
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
      ),
    },
    {
      key: 'u_fname',
      label: 'ชื่อผู้รับการประเมิน',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.prefix_name}{record.u_fname} {record.u_lname}
        </span>
      ),
    },
    {
      key: 'ex_position_name',
      label: 'ตำแหน่งบริหาร',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.ex_position_name}
        </span>
      ),
    },
    {
      key: 'u_id_card',
      label: 'รหัสผู้รับการประเมิน',
      align: 'left',
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.u_id_card}
        </span>
      ),
    },
    {
      key: 'workload_group_name',
      label: 'กลุ่มภาระงาน',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {record.workload_group_name ? (
            <span className="text-green-500 dark:text-gray-400">
              {record.workload_group_name}
            </span>
          ) : (
            <span className="text-red-500 dark:text-gray-400">
              ยังไม่ได้เลือกกลุ่มภาระงาน
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'evaluation_status',
      label: 'สถานะ',
      align: 'left',
      width: '150px',
      render: (_, record) => {
        const status = evaluationStatuses[record.set_asses_list_id]
        if (!status) {
          return (
            <span className="inline-block rounded-md bg-gray-600 text-white px-2 py-0.5 text-sm font-light">
              กำลังโหลด...
            </span>
          )
        }

        const getStatusDisplay = () => {
          switch (status.evaluation_status) {
            case 'completed':
              return 'เสร็จสิ้น'
            case 'in_progress':
              return 'กำลังดำเนินการ'
            case 'not_started':
            default:
              return 'ยังไม่เริ่มการประเมิน'
          }
        }

        const statusText = getStatusDisplay()
        const statusClass = statusStyles[status.evaluation_status] || 'bg-gray-600 text-white'

        return (
          <span className={`inline-block rounded-md ${statusClass} px-2 py-0.5 text-sm font-light`}>
            {statusText}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <button
            className={`cursor-pointer rounded-md border-none p-1 transition duration-300 ease-in-out ${
              checkboxStates[record.set_asses_list_id]
                ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                : 'border-success text-success hover:bg-success hover:text-white'
            }`}
            onClick={() => handleCheckboxChange(record.set_asses_list_id, !checkboxStates[record.set_asses_list_id])}
            title={checkboxStates[record.set_asses_list_id] ? 'เปิดการประเมิน' : 'ปิดการประเมิน'}
          >
            {checkboxStates[record.set_asses_list_id] ? (
              <FileX className="h-4 w-4" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
          </button>
          <button
            className="cursor-pointer rounded-md border-none border-blue-500 p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
            onClick={() =>
              handleSetExUser(
                record.set_asses_list_id,
                record
              )
            }
          >
            <Eye className="h-4 w-4" />
          </button>
          {!checkDelete.set_asses_list_id.includes(
            record.set_asses_list_id
          ) ? (
            <label
              htmlFor={`modal-delete${record.set_asses_list_id}`}
              className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
              onClick={() => {
                setSelectedSetAssesListId(record.set_asses_list_id)
                setSelectedSetAsFname(record.u_fname)
                setSelectedSetAsLname(record.u_lname)
                setSelectedSetAsPrefixname(record.prefix_name)
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
        </div>
      ),
    },
  ]
}
