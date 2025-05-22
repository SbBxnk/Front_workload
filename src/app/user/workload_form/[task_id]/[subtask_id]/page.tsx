"use client"
import { useParams } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
// แก้ไข import เพื่อเพิ่ม icon สำหรับรูปภาพ
import { Loader, Plus, Trash2, FileText, LinkIcon, ChevronDown, MoreVertical, PenSquare, ImageIcon } from "lucide-react"
import useAuthHeaders from "@/hooks/Header"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Swal from "sweetalert2"
import CreateModal from "./createModal"
import DeleteModal from "./deleteModal"
import EditModal from "./editModal"

interface ApiFormData {
  subtask_name: string
  task_name: string
  as_u_id: number
  u_fname: string
  u_lname: string
  prefix_name: string
  formlist_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: "link" | "external file" | "file in system"
  link: string
  link_name: string
  ex_score: number
  form_id: number
  files: FileData[]
  links?: {
    link_id: number
    link_path: string
    link_name: string
  }[]
}

interface FileData {
  file_name: string
  size: number
  form_id: number
  fileinfo_id?: number
}

interface LinkData {
  link_id?: number
  link_path: string
  link_name: string
  form_id: number
}

interface Subtask {
  subtask_id: number
  subtask_name: string
}

interface DecodedToken {
  id: number
}

interface WorkloadGroup {
  workload_group_id: number | null
  workload_group_name: string | null
  formlist_id: number | null
}

interface FileInfo {
  fileinfo_id: number
  file_name: string
  file_path: string
  form_id: number
  size: number
}

interface FormInfo {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  quality: number
  workload: number
  file_type: "link" | "external file" | "file in system"
  ex_score: number
  subtask_id: number
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
const isImageFile = (fileName: string | null | undefined): boolean => {
  if (!fileName) return false // ถ้า fileName เป็น null หรือ undefined ให้คืนค่า false

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
  return imageExtensions.includes(ext)
}

function WorkloadSubtaskInfo() {
  const { subtask_id, task_id } = useParams()
  const headers = useAuthHeaders()
  const [subtask, setSubtask] = useState<Subtask | null>(null)
  const [subtaskIndex, setSubtaskIndex] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [workloadGroupInfo, setWorkloadGroupInfo] = useState<WorkloadGroup | null>(null)
  const [formList, setFormList] = useState<(FormInfo & { total_score: number })[]>([])
  const [fileInfos, setFileInfos] = useState<{ [form_id: number]: FileInfo[] }>({})
  const [formFiles, setFormFiles] = useState<{ [form_id: number]: FileData[] }>({})
  const [formLinks, setFormLinks] = useState<{ [form_id: number]: LinkData[] }>({})
  const [formSystemFiles, setFormSystemFiles] = useState<{ [form_id: number]: FileData }>({})
  const [, setFormFileNames] = useState<{ [form_id: number]: string }>({})
  const [dropdownOpen, setDropdownOpen] = useState<{ [index: number]: boolean }>({})
  const [isOpen, setIsOpen] = useState<{ [index: number]: boolean }>({})
  const [editFormId, setEditFormId] = useState<number | null>(null)
  const [formDetail, setFormDetail] = useState<FormInfo | null>(null)

  const toggleDropdown = (index: number) => {
    setDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const closeDropdown = (index: number) => {
    setDropdownOpen((prev) => ({ ...prev, [index]: false }))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return
      const target = event.target as HTMLElement
      if (!target.closest(".dropdown-container")) {
        setDropdownOpen({})
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
    // eslint-disable-next-line
  }, [userId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subtaskResponse, taskSubtasksResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/subtask/${subtask_id}`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/subtask/task/${task_id}`, { headers }),
        ])

        const subtaskData: Subtask = subtaskResponse.data.data
        const taskSubtasks: Subtask[] = taskSubtasksResponse.data.data

        setSubtask(subtaskData)

        const sortedSubtasks = taskSubtasks.sort((a, b) => a.subtask_id - b.subtask_id)
        const index = sortedSubtasks.findIndex((st) => st.subtask_id === Number(subtask_id))

        setSubtaskIndex(index !== -1 ? `${task_id}.${index + 1}` : "Subtask ไม่พบ")
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (subtask_id && task_id) fetchData()
    // eslint-disable-next-line
  }, [subtask_id, task_id])

useEffect(() => {
  const fetchFormInfo = async () => {
    if (workloadGroupInfo?.formlist_id && subtask_id) {
      try {
        // เพิ่ม userId ในการเรียก API
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_form/form_info/${workloadGroupInfo.formlist_id}/${subtask_id}?as_u_id=${userId}`,
          { headers },
        )

        const apiForms: ApiFormData[] = response.data.data

          const newForms: (FormInfo & { total_score: number })[] = apiForms.map((apiForm) => ({
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
          }))

          const initialOpenState = newForms.reduce(
            (acc, _, index) => {
              acc[index] = true
              return acc
            },
            {} as { [index: number]: boolean },
          )
          setIsOpen(initialOpenState)

          const newFormFiles: { [form_id: number]: FileData[] } = {}
          apiForms.forEach((apiForm) => {
            if (apiForm.file_type === "external file" && apiForm.files.length > 0) {
              newFormFiles[apiForm.form_id] = apiForm.files
            }
          })

          // Update to handle multiple links per form
          const newFormLinks: { [form_id: number]: LinkData[] } = {}
          apiForms.forEach((apiForm) => {
            if (apiForm.file_type === "link") {
              // Check if the API response has links in a specific format
              if (apiForm.links && Array.isArray(apiForm.links)) {
                newFormLinks[apiForm.form_id] = apiForm.links.map((link) => ({
                  link_id: link.link_id,
                  link_path: link.link_path,
                  link_name: link.link_name || link.link_path,
                  form_id: apiForm.form_id,
                }))
              }
              // Fallback to the old format if needed
              else if (apiForm.link && apiForm.link !== "-") {
                newFormLinks[apiForm.form_id] = [
                  {
                    link_path: apiForm.link,
                    link_name: apiForm.link_name || apiForm.link,
                    form_id: apiForm.form_id,
                  },
                ]
              } else {
                // Initialize with empty array if no links
                newFormLinks[apiForm.form_id] = []
              }
            }
          })

          setFormList(newForms)
          setFormFiles(newFormFiles)
          setFormLinks(newFormLinks)

          apiForms.forEach((apiForm) => {
            fetchFilesForForm(apiForm.form_id)
          })
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setFormList([])
            setFormFiles({})
            setFormLinks({})
            setIsOpen({})
          } else {
            console.error("Error fetching form info:", error)
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูลฟอร์ม")
          }
        }
      }
    }

    fetchFormInfo()
    // eslint-disable-next-line
}, [workloadGroupInfo?.formlist_id, subtask_id, userId])

  // เพิ่มฟังก์ชันนี้เพื่อตรวจสอบข้อมูล
  useEffect(() => {
    // ตรวจสอบข้อมูลเมื่อโหลดเสร็จ
    if (!loading && formList.length > 0) {
      console.log("Form List:", formList)
      formList.forEach((form) => {
        console.log(`Form ID ${form.form_id}:`, {
          title: form.form_title,
          file_type: form.file_type,
          has_links: formLinks[form.form_id]?.length > 0,
          has_files: formFiles[form.form_id]?.length > 0,
          links: formLinks[form.form_id],
          files: formFiles[form.form_id],
        })
      })
    }
  }, [loading, formList, formLinks, formFiles])

  const fetchFilesForForm = async (formlist_id: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/workload_form/file_info/${workloadGroupInfo?.formlist_id}`,
        { headers },
      )
      const files: FileInfo[] = response.data.data
      setFileInfos((prev) => ({ ...prev, [formlist_id]: files }))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setFileInfos((prev) => ({ ...prev, [formlist_id]: [] }))
      } else {
        console.error(`Error fetching files for form ${formlist_id}:`, error)
      }
    }
  }

  const handleAddDisplayForm = async (
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string }[],
    fileInSystem?: string,
    fileName?: string,
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const evidenceType = formData.get("file_type") as "link" | "external file" | "file in system"

    // Prepare FormData for API
    const apiFormData = new FormData()
    apiFormData.append("as_u_id", String(userId || 0))
    apiFormData.append("formlist_id", String(workloadGroupInfo?.formlist_id || 0))
    apiFormData.append("subtask_id", String(subtask_id || 0))
    apiFormData.append("form_title", formData.get("form_title") as string)
    apiFormData.append("description", formData.get("description") as string)
    apiFormData.append("quality", formData.get("quality") as string)
    apiFormData.append("workload", formData.get("workload") as string)
    apiFormData.append("file_type", evidenceType)
    apiFormData.append("ex_score", "0")

    if (evidenceType === "link" && links && links.length > 0) {
      // Add links as JSON string
      apiFormData.append("links", JSON.stringify(links))
    } else if (evidenceType === "file in system" && fileInSystem) {
      apiFormData.append("link", fileInSystem)
      apiFormData.append("link_name", fileName || fileInSystem)
    } else {
      apiFormData.append("link", "-")
      apiFormData.append("link_name", "-")
    }

    if (evidenceType === "external file" || evidenceType === "file in system") {
      uploadedFiles.forEach((file) => {
        apiFormData.append("files", file)
      })
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/workload_form/form_info/add`, apiFormData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      })
      console.log(apiFormData)

      const apiForm: ApiFormData = response.data.data[0]

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

      if (apiForm.file_type === "external file" && apiForm.files.length > 0) {
        setFormFiles((prev) => ({ ...prev, [apiForm.form_id]: apiForm.files }))
      } else if (apiForm.file_type === "link" && apiForm.links && apiForm.links.length > 0) {
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
      } else if (apiForm.file_type === "link" && apiForm.link && apiForm.link !== "-") {
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
      } else if (apiForm.file_type === "file in system" && apiForm.files.length > 0) {
        setFormSystemFiles((prev) => ({
          ...prev,
          [apiForm.form_id]: apiForm.files[0],
        }))
      }

      // Close modal first
      const modal = document.getElementById("modal-forminfo") as HTMLInputElement
      if (modal) modal.checked = false

      // Then show success alert
      await Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        text: "รายละเอียดภาระงานถูกเพิ่มเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      })

      // Scroll to the newly added item
      setTimeout(() => {
        const newItemIndex = formList.length
        const newItemElement = document.querySelectorAll(`.bg-gray-50.shadow-sm.border-l-4`)[newItemIndex]
        if (newItemElement) {
          newItemElement.scrollIntoView({ behavior: "smooth", block: "center" })

          // Open the dropdown for the new item
          setIsOpen((prev) => ({ ...prev, [newItemIndex]: true }))
        }
      }, 100)
    } catch (error) {
      console.error("Error adding form:", error)
      let errorMessage = "เกิดข้อผิดพลาดในการเพิ่มข้อมูล"
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      // Show error alert
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        confirmButtonText: "ตกลง",
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
    filesToDelete?: number[],
  ) => {
    event.preventDefault()

    // Directly process the edit without confirmation
    const formData = new FormData(event.currentTarget)
    const evidenceType = formData.get("file_type") as "link" | "external file" | "file in system"

    // Prepare FormData for API
    const apiFormData = new FormData()
    apiFormData.append("form_id", String(form_id))
    apiFormData.append("form_title", formData.get("form_title") as string)
    apiFormData.append("description", formData.get("description") as string)
    apiFormData.append("quality", formData.get("quality") as string)
    apiFormData.append("workload", formData.get("workload") as string)
    apiFormData.append("file_type", evidenceType)

    // แสดงข้อมูลที่จะส่งไปยัง backend
    console.log("Preparing to send form data:", {
      form_id,
      form_title: formData.get("form_title"),
      description: formData.get("description"),
      quality: formData.get("quality"),
      workload: formData.get("workload"),
      file_type: evidenceType,
    })

    if (evidenceType === "link" && links && links.length > 0) {
      // Add links as JSON string
      apiFormData.append("links", JSON.stringify(links))
      console.log("Links to send:", links)

      // เพิ่ม existing_links สำหรับลิงก์ที่มีอยู่แล้ว
      const existingLinkIds = links
        .filter((link) => link.link_id)
        .map((link) => link.link_id)
        .filter(Boolean)

      if (existingLinkIds.length > 0) {
        existingLinkIds.forEach((linkId) => {
          apiFormData.append("existing_links", String(linkId))
        })
        console.log("Existing link IDs:", existingLinkIds)
      }
    } else if (evidenceType === "file in system" && fileInSystem) {
      apiFormData.append("link", fileInSystem)
      apiFormData.append("link_name", fileName || fileInSystem)
    } else {
      apiFormData.append("link", "-")
      apiFormData.append("link_name", "-")
    }

    // Add existing files to keep
    if (existingFiles && existingFiles.length > 0) {
      existingFiles.forEach((file) => {
        if (file.fileinfo_id) {
          apiFormData.append("existing_files", String(file.fileinfo_id))
          console.log(`Keeping file: ${file.file_name} (ID: ${file.fileinfo_id})`)
        }
      })
    }

    // Add files to delete
    if (filesToDelete && filesToDelete.length > 0) {
      filesToDelete.forEach((fileId) => {
        apiFormData.append("files_to_delete", String(fileId))
        console.log(`Marking file ID ${fileId} for deletion`)
      })
    }

    // Add links to delete
    const formLinksToDelete = Array.from(document.querySelectorAll('input[name="links_to_delete"]')).map(
      (input) => (input as HTMLInputElement).value,
    )

    if (formLinksToDelete.length > 0) {
      formLinksToDelete.forEach((linkId) => {
        apiFormData.append("links_to_delete", linkId)
      })
      console.log("Links to delete:", formLinksToDelete)
    }

    // Add new files
    if (uploadedFiles.length > 0 && (evidenceType === "external file" || evidenceType === "file in system")) {
      uploadedFiles.forEach((file) => {
        apiFormData.append("files", file)
        console.log(`Adding new file: ${file.name}`)
      })
    }

    try {
      console.log("Sending form data:", Object.fromEntries(apiFormData.entries()))

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API}/workload_form/form_info/update`, apiFormData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      })

      const updatedForm = response.data.data

      // Log which files were deleted
      if (response.data.deletedFiles && response.data.deletedFiles.length > 0) {
        console.log("Files deleted from database:", response.data.deletedFiles)
      }

      // Log which links were deleted
      if (response.data.deletedLinks && response.data.deletedLinks.length > 0) {
        console.log("Links deleted from database:", response.data.deletedLinks)
      }

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
            : form,
        ),
      )

      // Update files in state
      if (updatedForm.file_type === "external file" && updatedForm.files && updatedForm.files.length > 0) {
        setFormFiles((prev) => ({ ...prev, [form_id]: updatedForm.files }))
      } else if (updatedForm.file_type === "link" && updatedForm.links && updatedForm.links.length > 0) {
        // Handle multiple links
        setFormLinks((prev) => ({
          ...prev,
          [form_id]: updatedForm.links.map((link: { link_id: number; link_path: string; link_name: string }) => ({
            link_id: link.link_id,
            link_path: link.link_path,
            link_name: link.link_name || link.link_path,
            form_id: form_id,
          })),
        }))
      } else if (updatedForm.file_type === "link" && updatedForm.link && updatedForm.link !== "-") {
        // Fallback for single link
        setFormLinks((prev) => ({
          ...prev,
          [form_id]: [
            {
              link_path: updatedForm.link,
              link_name: updatedForm.link_name || updatedForm.link,
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
        icon: "success",
        title: "อัปเดตข้อมูลสำเร็จ",
        text: "รายละเอียดภาระงานถูกอัปเดตเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error updating form:", error)
      let errorMessage = "เกิดข้อผิดพลาดในการอัปเดตข้อมูล"
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        confirmButtonText: "ตกลง",
      })
    }
  }

  const handleViewEvidence = (fileInfo: FileInfo) => {
    window.open(`/files/${fileInfo.file_name}`, "_blank")
  }

  const toggleForm = (index: number) => {
    setIsOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const totalSum = formList.reduce((sum, form) => sum + form.total_score, 0)

  const handleDelete = (form_id: number) => {
    // Find the checkbox element and check it
    setTimeout(() => {
      const checkbox = document.getElementById(`confirm-modal-${form_id}`) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = true
      }
    }, 0)
  }

const fetchFormDetail = async (id: number) => {
  try {
    // เพิ่ม userId ในการเรียก API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/workload_form/form_info_detail/${id}?as_u_id=${userId}`, 
      { headers }
    )

    if (response.data.status && response.data.data) {
      setFormDetail(response.data.data)
    }
  } catch (err) {
    console.error("Error fetching form data:", err)
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    })
  }
}
  const handleEdit = (form_id: number) => {
    setEditFormId(form_id)
    fetchFormDetail(form_id)

    // Find the checkbox element and check it
    setTimeout(() => {
      const checkbox = document.getElementById(`edit-modal-${form_id}`) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = true
      }
    }, 0)
  }

  const comfirmDelete = async (form_id: number) => {
    try {
      // Close the modal first
      const checkbox = document.getElementById(`confirm-modal-${form_id}`) as HTMLInputElement
      if (checkbox) {
        checkbox.checked = false
      }

      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API}/workload_form/form_info/${form_id}`, {
        headers,
      })

      if (response.status === 200) {
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
        const indexToRemove = formList.findIndex((form) => form.form_id === form_id)
        if (indexToRemove !== -1) {
          setIsOpen((prev) => {
            const newIsOpen = { ...prev }
            delete newIsOpen[indexToRemove]
            return Object.keys(newIsOpen).reduce(
              (acc, key, i) => {
                acc[i] = newIsOpen[Number(key)]
                return acc
              },
              {} as { [index: number]: boolean },
            )
          })
        }

        // Show success message
        Swal.fire({
          icon: "success",
          title: "ลบรายการสำเร็จ",
          text: "รายการถูกลบเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถลบรายการได้",
        confirmButtonText: "ตกลง",
      })
    }
  }

  useEffect(() => {
    const handleModalClose = () => {
      if (editFormId) {
        const modalCheckbox = document.getElementById(`edit-modal-${editFormId}`) as HTMLInputElement
        if (modalCheckbox) {
          modalCheckbox.addEventListener("change", (e) => {
            if (!(e.target as HTMLInputElement).checked) {
              // Reset form detail when modal is closed
              setFormDetail(null)
            }
          })

          return () => {
            modalCheckbox.removeEventListener("change", () => {})
          }
        }
      }
    }

    handleModalClose()
  }, [editFormId])

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

  if (error) return <div className="text-red-500">{error}</div>
  if (!subtask || !subtaskIndex) return null

  return (
    <>
      <CreateModal onSubmit={handleAddDisplayForm} />
      <EditModal form_id={editFormId} formDetail={formDetail} onSubmit={handleEditForm} />
      {formList.map((form, index) => (
        <DeleteModal
          key={`delete-modal-${form.form_id}-${index}`}
          comfirmDelete={comfirmDelete}
          form_id={form.form_id}
        />
      ))}

      <div className="">
        <div className="bg-white p-4 rounded-t-lg shadow-lg dark:bg-zinc-900 dark:text-gray-300">
          <div className="space-y-6">
            <h1 className="text-[16px] md:text-2xl font-semibold text-business1 dark:text-blue-400 ">
              {subtaskIndex} {subtask.subtask_name}
            </h1>
            {formList.map((form, index) => (
              <div
                key={index}
                className={`p-4 bg-gray-50 shadow-sm border-l-4 border-business1/50 dark:bg-zinc-800 dark:border dark:border-zinc-700`}
              >
                <div className={`flex justify-between items-center ${isOpen[index] ? "mb-2" : "mb-0"} `}>
                  <button
                    onClick={() => toggleForm(index)}
                    className="flex items-center text-[16px] md:text-lg font-medium text-business1/80 dark:text-gray-200 hover:text-business1 dark:hover:text-gray-100 max-w-[90%] md:max-w-full"
                  >
                    <ChevronDown
                      className={`h-10 w-10 md:h-5 md:w-5 mr-2 transform transition-transform duration-300 ${
                        isOpen[index] ? "rotate-180" : ""
                      }`}
                    />
                    {subtaskIndex}.{index + 1} {form.form_title}
                  </button>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown(index)}
                      className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-150"
                      title="ตัวเลือกเพิ่มเติม"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {dropdownOpen[index] && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleEdit(form.form_id)
                            closeDropdown(index)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                        >
                          <PenSquare className="h-4 w-4 mr-2 text-amber-500" />
                          <p className="text-gray-600 dark:text-gray-400 m-0">แก้ไขรายละเอียด</p>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(form.form_id)
                            closeDropdown(index)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          <p className="text-gray-600 dark:text-gray-400 m-0">ลบรายการ</p>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen[index] ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-2"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 ml-4 gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="md:col-span-2 grid gap-2">
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg transition-all duration-200">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">คำอธิบาย:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{form.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg transition-all duration-200">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ภาระงาน:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{form.workload}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg transition-all duration-200">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวน:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{form.quality}</p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg transition-all duration-200">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">รวมภาระงาน:</p>
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {form.total_score}
                        </p>
                      </div>
                    </div>
                    {/* แก้ไขส่วนการแสดงผลไฟล์หลักฐาน */}
                    <div className="h-full">
                      {(formFiles[form.form_id]?.length > 0 ||
                        formLinks[form.form_id]?.length > 0 ||
                        formSystemFiles[form.form_id] ||
                        fileInfos[form.form_id]?.length > 0) && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg transition-all duration-200 h-full">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ไฟล์หลักฐาน:</p>
                          <ul className="mt-2 space-y-2">
                            {/* ตรวจสอบประเภทของฟอร์มและแสดงผลตามประเภท */}
                            {form.file_type === "link" && formLinks[form.form_id]?.length > 0 ? (
                              // แสดงลิงก์ก่อน (สลับลำดับการตรวจสอบ)
                              formLinks[form.form_id].map((link: LinkData, index: number) => (
                                <li key={index}>
                                  <button
                                    onClick={() => window.open(link.link_path, "_blank")}
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-150 text-sm"
                                  >
                                    <LinkIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                    <span className="truncate max-w-[150px] md:max-w-[400px]">{link.link_name}</span>
                                  </button>
                                </li>
                              ))
                            ) : form.file_type === "external file" && formFiles[form.form_id]?.length > 0 ? (
                              // แสดงไฟล์
                              formFiles[form.form_id].map((file: FileData, index: number) => (
                                <li key={index}>
                                  <button
                                    onClick={() => {
                                      const url = `/files/${file.file_name}`
                                      window.open(url, "_blank")
                                    }}
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-150 text-sm"
                                  >
                                    {isImageFile(file.file_name) ? (
                                      <ImageIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                    ) : (
                                      <FileText className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                    )}
                                    <span className="truncate max-w-[150px] md:max-w-[400px]">{file.file_name}</span>
                                  </button>
                                </li>
                              ))
                            ) : form.file_type === "file in system" && formSystemFiles[form.form_id] ? (
                              <li>
                                <button
                                  onClick={() =>
                                    window.open(`/files/${formSystemFiles[form.form_id].file_name}`, "_blank")
                                  }
                                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-150 text-sm"
                                >
                                  {isImageFile(formSystemFiles[form.form_id].file_name) ? (
                                    <ImageIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                  ) : (
                                    <FileText className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                  )}
                                  <span className="truncate max-w-[150px]">
                                    {formSystemFiles[form.form_id].file_name}
                                  </span>
                                </button>
                              </li>
                            ) : fileInfos[form.form_id]?.length > 0 ? (
                              fileInfos[form.form_id].map((fileInfo) => (
                                <li key={fileInfo.fileinfo_id}>
                                  <button
                                    onClick={() => handleViewEvidence(fileInfo)}
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-150 text-sm"
                                  >
                                    {isImageFile(fileInfo.file_name) ? (
                                      <ImageIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                    ) : (
                                      <FileText className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                    )}
                                    <span className="truncate max-w-[150px]">{fileInfo.file_name}</span>
                                  </button>
                                </li>
                              ))
                            ) : null}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 flex flex-col justify-end bg-white w-full p-4 rounded-b-lg shadow-lg dark:bg-zinc-900 dark:text-gray-300 gap-[16px]">
          <div className={`${totalSum === 0 ? "bg-gray-100" : "bg-green-100"} px-4 py-3 rounded-lg dark:bg-zinc-700`}>
            <p className="text-md font-medium text-gray-700 dark:text-gray-300">
              ผลรวมคะแนนรวมทั้งหมด: <span className="font-semibold">{totalSum}</span>
            </p>
          </div>
          <label
            htmlFor={`modal-forminfo`}
            className="inline-flex items-center justify-center w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg cursor-pointer transition-colors duration-150 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-600 dark:hover:border-zinc-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มรายละเอียดภาระงาน
          </label>
        </div>
      </div>
    </>
  )
}

export default WorkloadSubtaskInfo
