'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { Session } from 'next-auth'
import Swal from 'sweetalert2'
import WorkloadFormServices from '@/services/workloadFormServices'
import { BASE_URL_FILE } from '@/provider/config'
import type {
  ApiFormData,
  FileData,
  FileInfo,
  FormInfo,
  WorkloadGroup,
} from './types'

interface UseSubtaskFormActionsParams {
  subtask_id: string | string[] | undefined
  session: Session | null
  userId: number | null
  workloadGroupInfo: WorkloadGroup | null
  formList: (FormInfo & { total_score: number })[]
  setFormList: React.Dispatch<
    React.SetStateAction<(FormInfo & { total_score: number })[]>
  >
  setFormFiles: React.Dispatch<
    React.SetStateAction<{ [form_id: number]: FileData[] }>
  >
  setFormLinks: React.Dispatch<
    React.SetStateAction<{ [form_id: number]: import('./types').LinkData[] }>
  >
  setFormSystemFiles: React.Dispatch<
    React.SetStateAction<{ [form_id: number]: FileData }>
  >
  setFormFileNames: React.Dispatch<
    React.SetStateAction<{ [form_id: number]: string }>
  >
  setIsOpen: React.Dispatch<
    React.SetStateAction<{ [index: number]: boolean }>
  >
}

export function useSubtaskFormActions({
  subtask_id,
  session,
  userId,
  workloadGroupInfo,
  formList,
  setFormList,
  setFormFiles,
  setFormLinks,
  setFormSystemFiles,
  setFormFileNames,
  setIsOpen,
}: UseSubtaskFormActionsParams) {
  const [editFormId, setEditFormId] = useState<number | null>(null)
  const [formDetail, setFormDetail] = useState<FormInfo | null>(null)

  const handleAddDisplayForm = async (
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string }[],
    fileInSystem?: string,
    fileName?: string
  ) => {
    event.preventDefault()

    // ตรวจสอบว่ามี workloadGroupInfo หรือไม่
    if (!workloadGroupInfo || !workloadGroupInfo.formlist_id) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลกลุ่มภาระงาน กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
      })
      return
    }

    const formData = new FormData(event.currentTarget)

    const evidenceType = formData.get('file_type') as
      | 'link'
      | 'external file'
      | 'file in system'

    // Prepare FormData for API
    const apiFormData = new FormData()
    apiFormData.append('as_u_id', String(userId || 0))
    apiFormData.append('formlist_id', String(workloadGroupInfo.formlist_id))
    apiFormData.append('subtask_id', String(subtask_id || 0))
    apiFormData.append('form_title', formData.get('form_title') as string)
    apiFormData.append('description', formData.get('description') as string)
    apiFormData.append('quality', formData.get('quality') as string)
    apiFormData.append('workload', formData.get('workload') as string)
    apiFormData.append('file_type', evidenceType)
    apiFormData.append('ex_score', '0')

    if (evidenceType === 'link' && links && links.length > 0) {
      // Add links as JSON string
      apiFormData.append('links', JSON.stringify(links))
    } else if (evidenceType === 'file in system' && fileInSystem) {
      apiFormData.append('link', fileInSystem)
      apiFormData.append('link_name', fileName || fileInSystem)
    } else {
      apiFormData.append('link', '-')
      apiFormData.append('link_name', '-')
    }

    // ตรวจสอบว่ามีไฟล์ที่จะอัปโหลดหรือไม่
    if (evidenceType === 'external file' && uploadedFiles.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณาเลือกไฟล์',
        text: 'คุณต้องเลือกไฟล์อย่างน้อย 1 ไฟล์',
        confirmButtonText: 'ตกลง',
      })
      return
    }

    // ตรวจสอบขนาดไฟล์รวม
    if (uploadedFiles.length > 0) {
      const totalSize = uploadedFiles.reduce(
        (total, file) => total + file.size,
        0
      )
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (totalSize > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'ขนาดไฟล์เกินกำหนด',
          text: 'ขนาดไฟล์รวมต้องไม่เกิน 10MB',
          confirmButtonText: 'ตกลง',
        })
        return
      }
    }

    if (evidenceType === 'external file' || evidenceType === 'file in system') {
      uploadedFiles.forEach((file) => {
        apiFormData.append('files', file)
      })
    }


    try {
      if (!session?.accessToken) {
        throw new Error('No access token available')
      }

      const response = await WorkloadFormServices.addFormInfo(apiFormData)
      // ใช้ legacy format เหมือนเดิม
      const data = response.data
      const apiForm: ApiFormData = (data?.[0] || {}) as ApiFormData

      const newForm: FormInfo & { total_score: number } = {
        form_id: apiForm.form_id,
        as_u_id: apiForm.as_u_id,
        formlist_id: apiForm.formlist_id,
        form_title: apiForm.form_title,
        description: apiForm.description,
        quality: apiForm.quality,
        workload: apiForm.workload,
        file_type: apiForm.file_type,
        ex_score: apiForm.ex_score,
        subtask_id: Number(subtask_id),
        total_score: apiForm.quality * apiForm.workload,
      }

      setFormList((prev) => [...prev, newForm])
      setIsOpen((prev) => ({ ...prev, [formList.length]: false }))

      if (apiForm.file_type === 'external file' && apiForm.files.length > 0) {
        setFormFiles((prev) => ({ ...prev, [apiForm.form_id]: apiForm.files }))
      } else if (
        apiForm.file_type === 'link' &&
        apiForm.links &&
        apiForm.links.length > 0
      ) {
        // Handle multiple links
        setFormLinks((prev) => ({
          ...prev,
          [apiForm.form_id]:
            apiForm.links?.map((link) => ({
              link_id: link.link_id,
              link_path: link.link_path,
              link_name: link.link_name || link.link_path,
              form_id: apiForm.form_id,
            })) || [],
        }))
      } else if (
        apiForm.file_type === 'link' &&
        apiForm.link &&
        apiForm.link !== '-'
      ) {
        setFormLinks((prev) => ({
          ...prev,
          [apiForm.form_id]: [
            {
              link_path: apiForm.link,
              link_name: apiForm.link_name || apiForm.link,
              form_id: apiForm.form_id,
            },
          ],
        }))
      } else if (
        apiForm.file_type === 'file in system' &&
        apiForm.files.length > 0
      ) {
        setFormSystemFiles((prev) => ({
          ...prev,
          [apiForm.form_id]: apiForm.files[0],
        }))
      }

      // Close modal first
      const modal = document.getElementById(
        'modal-forminfo'
      ) as HTMLInputElement
      if (modal) modal.checked = false

      // Then show success alert
      await Swal.fire({
        icon: 'success',
        title: 'เพิ่มข้อมูลสำเร็จ',
        text: 'รายละเอียดภาระงานถูกเพิ่มเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      })

      // Reset form after successful submission
      setTimeout(() => {
        const form = document.getElementById('modal-forminfo')?.closest('.modal')?.querySelector('form')
        if (form) {
          form.reset()
        }
      }, 100)

      // Scroll to the newly added item
      setTimeout(() => {
        const newItemIndex = formList.length
        const newItemElement = document.querySelectorAll(
          `.bg-gray-50.shadow-sm.border-l-4`
        )[newItemIndex]
        if (newItemElement) {
          newItemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

          // Open the dropdown for the new item
          setIsOpen((prev) => ({ ...prev, [newItemIndex]: true }))
        }
      }, 100)
    } catch (error) {
      console.error('Error adding form:', error)
      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล'

      const axiosError = error as {
        response?: { data?: { error?: string }; status?: number }
      }
      console.error('API Error Response:', axiosError.response?.data)
      if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error
      } else if (axiosError.response?.status === 413) {
        errorMessage = 'ขนาดไฟล์รวมใหญ่เกินไป กรุณาลดขนาดหรือจำนวนไฟล์'
      }

      // Show error alert
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
      })
    }
  }
  const handleEditForm = async (
    form_id: number,
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string; link_id?: number }[],
    fileInSystem?: string,
    fileName?: string,
    existingFiles?: FileData[],
    filesToDelete?: number[]
  ) => {
    event.preventDefault()

    // Directly process the edit without confirmation
    const formData = new FormData(event.currentTarget)
    const evidenceType = formData.get('file_type') as
      | 'link'
      | 'external file'
      | 'file in system'

    // Prepare FormData for API
    const apiFormData = new FormData()
    apiFormData.append('form_id', String(form_id))
    apiFormData.append('form_title', formData.get('form_title') as string)
    apiFormData.append('description', formData.get('description') as string)
    apiFormData.append('quality', formData.get('quality') as string)
    apiFormData.append('workload', formData.get('workload') as string)
    apiFormData.append('file_type', evidenceType)


    if (evidenceType === 'link' && links && links.length > 0) {
      // Add links as JSON string
      apiFormData.append('links', JSON.stringify(links))

      // เพิ่ม existing_links สำหรับลิงก์ที่มีอยู่แล้ว
      const existingLinkIds = links
        .filter((link) => link.link_id)
        .map((link) => link.link_id)
        .filter(Boolean)

      if (existingLinkIds.length > 0) {
        existingLinkIds.forEach((linkId) => {
          apiFormData.append('existing_links', String(linkId))
        })
      }
    } else if (evidenceType === 'file in system' && fileInSystem) {
      apiFormData.append('link', fileInSystem)
      apiFormData.append('link_name', fileName || fileInSystem)
    } else {
      apiFormData.append('link', '-')
      apiFormData.append('link_name', '-')
    }

    // Add existing files to keep
    if (existingFiles && existingFiles.length > 0) {
      existingFiles.forEach((file) => {
        if (file.fileinfo_id) {
          apiFormData.append('existing_files', String(file.fileinfo_id))
        }
      })
    }

    // Add files to delete
    if (filesToDelete && filesToDelete.length > 0) {
      filesToDelete.forEach((fileId) => {
        apiFormData.append('files_to_delete', String(fileId))
      })
    }

    // Add links to delete
    const formLinksToDelete = Array.from(
      document.querySelectorAll('input[name="links_to_delete"]')
    ).map((input) => (input as HTMLInputElement).value)

    if (formLinksToDelete.length > 0) {
      formLinksToDelete.forEach((linkId) => {
        apiFormData.append('links_to_delete', linkId)
      })
    }

    // Add new files
    if (
      uploadedFiles.length > 0 &&
      (evidenceType === 'external file' || evidenceType === 'file in system')
    ) {
      uploadedFiles.forEach((file) => {
        apiFormData.append('files', file)
      })
    }

    try {
      if (!session?.accessToken) {
        throw new Error('No access token available')
      }


      const response = await WorkloadFormServices.updateFormInfo(apiFormData)
      // ใช้ legacy format เหมือนเดิม
      const data = response.data
      const updatedForm = data?.[0] || {}


      // Update form in state
      setFormList((prev) =>
        prev.map((form) =>
          form.form_id === form_id
            ? {
                ...form,
                form_title: updatedForm.form_title,
                description: updatedForm.description,
                quality: updatedForm.quality,
                workload: updatedForm.workload,
                file_type: updatedForm.file_type,
                total_score: updatedForm.quality * updatedForm.workload,
              }
            : form
        )
      )

      // Update files in state
      if (
        updatedForm.file_type === 'external file' &&
        updatedForm.files &&
        updatedForm.files.length > 0
      ) {
        setFormFiles((prev) => ({ ...prev, [form_id]: updatedForm.files }))
      } else if (
        updatedForm.file_type === 'link' &&
        updatedForm.links &&
        updatedForm.links.length > 0
      ) {
        // Handle multiple links
        setFormLinks((prev) => ({
          ...prev,
          [form_id]: updatedForm.links.map(
            (link: {
              link_id: number
              link_path: string
              link_name: string
            }) => ({
              link_id: link.link_id,
              link_path: link.link_path,
              link_name: link.link_name || link.link_path,
              form_id: form_id,
            })
          ),
        }))
      } else if (
        updatedForm.file_type === 'link' &&
        updatedForm.links &&
        updatedForm.links.length > 0
      ) {
        // Fallback for single link
        setFormLinks((prev) => ({
          ...prev,
          [form_id]: [
            {
              link_path: updatedForm.links[0].link_path,
              link_name: updatedForm.links[0].link_name,
              form_id: form_id,
            },
          ],
        }))
        // Remove from formFiles if it was previously a file
        setFormFiles((prev) => {
          const newFormFiles = { ...prev }
          delete newFormFiles[form_id]
          return newFormFiles
        })
      } else {
        // If no files remain, remove file data from state
        setFormFiles((prev) => {
          const newFormFiles = { ...prev }
          delete newFormFiles[form_id]
          return newFormFiles
        })
      }

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'อัปเดตข้อมูลสำเร็จ',
        text: 'รายละเอียดภาระงานถูกอัปเดตเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error updating form:', error)
      let errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
      const axiosError = error as { response?: { data?: { error?: string } } }
      if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error
      }

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
      })
    }
  }

  const handleViewEvidence = (fileInfo: FileInfo) => {
    const baseUrl = BASE_URL_FILE
    window.open(`${baseUrl}/files/${fileInfo.file_name}`, '_blank')
  }

  const handleDelete = (form_id: number) => {
    // Find the checkbox element and check it
    setTimeout(() => {
      const checkbox = document.getElementById(
        `confirm-modal-${form_id}`
      ) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = true
      }
    }, 0)
  }

  const fetchFormDetail = async (id: number) => {
    if (!session?.accessToken) return

    try {
      // เพิ่ม userId ในการเรียก API
      const response = await WorkloadFormServices.getFormDetail(id, userId || 0)

      // ใช้ legacy format เหมือนเดิม
      const data = response.data
      const isSuccess = response.status
      if (isSuccess && data && data.length > 0) {
        setFormDetail(data[0])
      }
    } catch (err) {
      console.error('Error fetching form data:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
      })
    }
  }
  const handleEdit = (form_id: number) => {
    setEditFormId(form_id)
    fetchFormDetail(form_id)

    // Find the checkbox element and check it
    setTimeout(() => {
      const checkbox = document.getElementById(
        `edit-modal-${form_id}`
      ) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = true
      }
    }, 0)
  }

  const comfirmDelete = async (form_id: number) => {
    if (!session?.accessToken) return

    try {
      // Close the modal first
      const checkbox = document.getElementById(
        `confirm-modal-${form_id}`
      ) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = false
      }

      const response = await WorkloadFormServices.deleteFormInfo(form_id)

      // ใช้ legacy format เหมือนเดิม
      const isSuccess = response.status
      if (isSuccess) {
        // Update state after successful deletion
        setFormList((prev) => prev.filter((form) => form.form_id !== form_id))
        setFormFiles((prev) => {
          const newFormFiles = { ...prev }
          delete newFormFiles[form_id]
          return newFormFiles
        })
        setFormLinks((prev) => {
          const newFormLinks = { ...prev }
          delete newFormLinks[form_id]
          return newFormLinks
        })
        setFormSystemFiles((prev) => {
          const newFormSystemFiles = { ...prev }
          delete newFormSystemFiles[form_id]
          return newFormSystemFiles
        })
        setFormFileNames((prev) => {
          const newFormFileNames = { ...prev }
          delete newFormFileNames[form_id]
          return newFormFileNames
        })

        // Update isOpen state
        const indexToRemove = formList.findIndex(
          (form) => form.form_id === form_id
        )
        if (indexToRemove !== -1) {
          setIsOpen((prev) => {
            const newIsOpen = { ...prev }
            delete newIsOpen[indexToRemove]
            return Object.keys(newIsOpen).reduce(
              (acc, key, i) => {
                acc[i] = newIsOpen[Number(key)]
                return acc
              },
              {} as { [index: number]: boolean }
            )
          })
        }

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'ลบรายการสำเร็จ',
          text: 'รายการถูกลบเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบรายการได้',
        confirmButtonText: 'ตกลง',
      })
    }
  }

  useEffect(() => {
    const handleModalClose = () => {
      if (editFormId) {
        const modalCheckbox = document.getElementById(
          `edit-modal-${editFormId}`
        ) as HTMLInputElement
        if (modalCheckbox) {
          modalCheckbox.addEventListener('change', (e) => {
            if (!(e.target as HTMLInputElement).checked) {
              // Reset form detail when modal is closed
              setFormDetail(null)
            }
          })

          return () => {
            modalCheckbox.removeEventListener('change', () => {})
          }
        }
      }
    }

    handleModalClose()
  }, [editFormId])

  return {
    editFormId,
    formDetail,
    handleAddDisplayForm,
    handleEditForm,
    handleViewEvidence,
    handleDelete,
    handleEdit,
    comfirmDelete,
  }
}
