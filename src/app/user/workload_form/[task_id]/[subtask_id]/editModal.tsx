"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { X, Link, Upload, CalendarClock, ImageIcon, FileText, Plus } from "lucide-react"

interface FileData {
  file_name: string
  size: number
  form_id: number
  fileinfo_id?: number // แก้ไขชื่อฟิลด์ให้ตรงกับฐานข้อมูล
}

interface LinkData {
  link_id?: number
  link_path: string
  link_name: string
  form_id?: number
}

interface FormData {
  form_id: number
  form_title: string
  description: string
  quality: number
  workload: number
  file_type: "link" | "external file" | "file in system"
  link?: string
  link_name?: string
  links?: LinkData[]
  files?: FileData[]
}

interface EditModalProps {
  form_id: number | null
  formDetail: FormData | null
  onSubmit: (
    form_id: number,
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string; link_id?: number }[],
    fileInSystem?: string,
    fileName?: string,
    existingFiles?: FileData[],
    filesToDelete?: number[],
  ) => void
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
  return imageExtensions.includes(ext)
}

// เพิ่ม interface สำหรับ file preview
interface FilePreview {
  file: File
  preview: string
}

export default function EditModal({ form_id, formDetail, onSubmit }: EditModalProps) {
  const [evidenceType, setEvidenceType] = useState<"link" | "external file" | "file in system">("link")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const [existingFiles, setExistingFiles] = useState<FileData[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  // เปลี่ยนจาก string เป็น array ของ links
  const [links, setLinks] = useState<LinkData[]>([])
  // เพิ่ม state สำหรับเก็บลิงก์ที่ต้องการลบ
  const [linksToDelete, setLinksToDelete] = useState<number[]>([])
  const [fileInSystem, setFileInSystem] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const modalCheckboxRef = useRef<HTMLInputElement | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles])

      // สร้าง previews สำหรับไฟล์รูปภาพ
      const newPreviews = acceptedFiles.map((file) => ({
        file,
        preview: isImageFile(file.name) ? URL.createObjectURL(file) : "",
      }))

      setFilePreviews((prev) => [...prev, ...newPreviews])
    },
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/webp": [".webp"],
    },
  })

  // ตรวจสอบการเปลี่ยนแปลงของ modal checkbox
  useEffect(() => {
    if (!form_id) return

    const modalCheckbox = document.getElementById(`edit-modal-${form_id}`) as HTMLInputElement
    if (modalCheckbox) {
      modalCheckboxRef.current = modalCheckbox

      // ฟังก์ชันที่จะทำงานเมื่อ checkbox เปลี่ยนสถานะ
      const handleModalChange = () => {
        // ถ้า modal ถูกปิด (checkbox ไม่ถูกเลือก)
        if (!modalCheckbox.checked && form_id) {
          // No need to fetch data here anymore
        }
      }

      // เพิ่ม event listener
      modalCheckbox.addEventListener("change", handleModalChange)

      // ทำความสะอาด event listener เมื่อ component unmount
      return () => {
        modalCheckbox.removeEventListener("change", handleModalChange)
      }
    }
  }, [form_id])

  const resetForm = () => {
    setUploadedFiles([])
    setFilePreviews([])
    setExistingFiles([])
    setFilesToDelete([])
    setLinks([])
    setLinksToDelete([])
    setFileInSystem("")
    setFileName("")
    setEvidenceType("link")
  }

  // แก้ไขฟังก์ชัน handleRemoveExistingFile เพื่อตรวจสอบจำนวนไฟล์ก่อนลบ
  const handleRemoveExistingFile = (fileId: number) => {
    // Make sure fileId has a value
    if (!fileId) return

    // Check if there will be at least one file left (either existing or newly uploaded)
    const totalFiles = existingFiles.length + uploadedFiles.length
    if (totalFiles <= 1 && evidenceType === "external file") {
      console.log("Cannot delete file: at least one file is required")
      return
    }

    console.log(`Removing file with ID: ${fileId}`)

    // Update existingFiles state by removing the file with matching fileinfo_id
    setExistingFiles((prevFiles) => {
      const newFiles = prevFiles.filter((file) => {
        // Check for fileinfo_id (the correct property name from your database)
        return file.fileinfo_id !== fileId
      })
      console.log("Files after removal:", newFiles)
      return newFiles
    })

    // Add the file ID to filesToDelete
    setFilesToDelete((prev) => [...prev, fileId])
  }

  // Fix the handleRemoveUploadedFile function to check file requirements
  const handleRemoveUploadedFile = (index: number) => {
    // Check if there will be at least one file left (either existing or newly uploaded)
    const totalFiles = existingFiles.length + uploadedFiles.length
    if (totalFiles <= 1 && evidenceType === "external file") {
      console.log("Cannot delete file: at least one file is required")
      return
    }

    // Store the file information before removing it for logging purposes
    const fileToRemove = uploadedFiles[index]
    console.log(`Marking file for deletion: ${fileToRemove.name}`)

    // Revoke object URL if it's an image preview
    if (filePreviews[index]?.preview) {
      URL.revokeObjectURL(filePreviews[index].preview)
    }

    setUploadedFiles((prevFiles) => {
      const newFiles = [...prevFiles]
      newFiles.splice(index, 1)
      return newFiles
    })

    setFilePreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews]
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  // เพิ่มฟังก์ชันสำหรับจัดการลิงก์
  const handleAddLink = () => {
    setLinks([...links, { link_path: "", link_name: "" }])
  }

  const handleRemoveLink = (index: number) => {
    const linkToRemove = links[index]

    // ถ้าลิงก์มี link_id (เป็นลิงก์ที่มีอยู่ในฐานข้อมูล) ให้เพิ่มเข้าไปใน linksToDelete
    if (linkToRemove.link_id) {
      setLinksToDelete((prev) => [...prev, linkToRemove.link_id as number])
      console.log(`Marking link with ID ${linkToRemove.link_id} for deletion`)
    }

    // ลบลิงก์ออกจาก state
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleLinkChange = (index: number, field: "link_path" | "link_name", value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  // แก้ไขฟังก์ชัน handleFormSubmit เพื่อส่ง links ไปให้ onSubmit
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form_id || !formDetail) return

    // ตรวจสอบว่ามีไฟล์อย่างน้อย 1 ไฟล์หรือไม่ (เฉพาะกรณี file_type เป็น "external file")
    if (evidenceType === "external file" && uploadedFiles.length < 1) {
      // ตรวจสอบว่ามีไฟล์เก่าหรือไม่
      if (existingFiles.length === 0) {
        alert("กรุณาอัปโหลดไฟล์อย่างน้อย 1 ไฟล์")
        return
      }
    }

    // กรองลิงก์ที่ว่างออกก่อนส่งข้อมูล
    const nonEmptyLinks = links.filter((link) => link.link_path.trim() !== "")

    // Log files that will be deleted from the database
    if (filesToDelete.length > 0) {
      console.log("Files to be deleted from database:", filesToDelete)
    }

    // Log links that will be deleted from the database
    if (linksToDelete.length > 0) {
      console.log("Links to be deleted from database:", linksToDelete)
    }

    // Log existing files that will be kept
    console.log("Existing files to keep:", existingFiles)

    // แปลง existingFiles เป็น array ของ IDs
    const existingFileIds = existingFiles.map((file) => file.fileinfo_id).filter(Boolean)
    console.log("Existing file IDs to keep:", existingFileIds)

    // Log links that will be kept or added
    console.log("Links to keep or add:", nonEmptyLinks)

    // เพิ่ม field linksToDelete ใน FormData ที่ส่งไปยัง API
    const formData = new FormData(event.currentTarget)

    // เพิ่ม links_to_delete เข้าไปใน formData
    if (linksToDelete.length > 0) {
      linksToDelete.forEach((linkId) => {
        formData.append("links_to_delete", String(linkId))
      })
    }

    // เพิ่ม existing_links เข้าไปใน formData สำหรับลิงก์ที่มีอยู่แล้ว
    if (evidenceType === "link") {
      const existingLinkIds = nonEmptyLinks
        .filter((link) => link.link_id)
        .map((link) => link.link_id)
        .filter(Boolean)

      console.log("Existing link IDs to keep:", existingLinkIds)

      if (existingLinkIds.length > 0) {
        existingLinkIds.forEach((linkId) => {
          formData.append("existing_links", String(linkId))
        })
      }
    }

    // เพิ่ม hidden input fields สำหรับ IDs ของไฟล์ที่ต้องการเก็บไว้
    if (evidenceType === "external file" && existingFiles.length > 0) {
      existingFiles.forEach((file) => {
        if (file.fileinfo_id) {
          formData.append("existing_files", String(file.fileinfo_id))
        }
      })
    }

    // เพิ่ม files_to_delete เข้าไปใน formData
    if (filesToDelete.length > 0) {
      filesToDelete.forEach((fileId) => {
        formData.append("files_to_delete", String(fileId))
      })
    }

    // แสดงข้อมูลที่จะส่งไปยัง backend
    console.log("Sending to backend:", {
      form_id,
      uploadedFiles: uploadedFiles.map((f) => f.name),
      links: evidenceType === "link" ? nonEmptyLinks : undefined,
      fileInSystem: evidenceType === "file in system" ? fileInSystem : undefined,
      fileName: evidenceType === "file in system" ? fileName : undefined,
      existingFiles: evidenceType === "external file" ? existingFiles : [],
      filesToDelete,
      linksToDelete,
      formDataEntries: Array.from(formData.entries()),
    })

    onSubmit(
      form_id,
      event,
      uploadedFiles,
      evidenceType === "link" ? nonEmptyLinks : undefined,
      evidenceType === "file in system" ? fileInSystem : undefined,
      evidenceType === "file in system" ? fileName : undefined,
      evidenceType === "external file" ? existingFiles : [],
      filesToDelete,
    )

    // Close modal immediately
    const modal = document.getElementById(`edit-modal-${form_id}`) as HTMLInputElement
    if (modal) modal.checked = false
  }

  // ฟังก์ชันสำหรับการยกเลิกการแก้ไข
  const handleCancel = () => {
    if (form_id) {
      // ไม่ต้องทำอะไรเพิ่มเติม
    }
  }

  useEffect(() => {
    if (formDetail) {
      setEvidenceType(formDetail.file_type)

      if (formDetail.file_type === "link") {
        // ตรวจสอบว่ามี links array หรือไม่
        if (formDetail.links && formDetail.links.length > 0) {
          console.log("Loading existing links:", formDetail.links)
          setLinks(formDetail.links)
        }
        // ถ้าไม่มี links array แต่มี link เดี่ยว (รูปแบบเก่า)
        else if (formDetail.link && formDetail.link !== "-") {
          console.log("Loading single link:", formDetail.link)
          setLinks([
            {
              link_path: formDetail.link,
              link_name: formDetail.link_name || formDetail.link,
            },
          ])
        }
        // ถ้าไม่มีลิงก์เลย ให้เริ่มต้นด้วยลิงก์เปล่า 3 ลิงก์
        else {
          console.log("No links found, initializing with empty links")
          setLinks([
            { link_path: "", link_name: "" },
            { link_path: "", link_name: "" },
            { link_path: "", link_name: "" },
          ])
        }
      } else if (formDetail.files && formDetail.files.length > 0) {
        setExistingFiles(formDetail.files)
        console.log("existingFiles loaded:", formDetail.files)
      }

      setUploadedFiles([])
      setFilePreviews([])
      setFilesToDelete([])
      setLinksToDelete([])
    } else {
      resetForm()
    }
  }, [formDetail])

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.preview) URL.revokeObjectURL(preview.preview)
      })
    }
  }, [filePreviews])

  if (!form_id) return null

  return (
    <>
      <div className="relative z-[100]">
        <input type="checkbox" id={`edit-modal-${form_id}`} className="modal-toggle" />
        <div className="modal" role="dialog">
          <div className="modal-box rounded-md dark:bg-zinc-800">
            <div className="flex items-center mb-4">
              <CalendarClock className="text-amber-500 dark:text-amber-400 mr-2 w-7 h-7" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 truncate">แก้ไขรายละเอียดภาระงาน</h3>
            </div>

            {formDetail ? (
              <form onSubmit={handleFormSubmit}>
                <div className="overflow-y-auto max-h-[calc(90vh-150px)] no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        ภาระงาน/กิจกรรม/โครงการ/งาน
                      </label>
                      <input
                        name="form_title"
                        type="text"
                        placeholder="ภาระงาน/กิจกรรม/โครงการ/งาน"
                        defaultValue={formDetail.form_title}
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                        required
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        คำอธิบาย
                      </label>
                      <textarea
                        name="description"
                        placeholder="คำอธิบาย"
                        defaultValue={formDetail.description}
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">จำนวน</label>
                      <input
                        name="quality"
                        type="number"
                        placeholder="จำนวน"
                        defaultValue={formDetail.quality}
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        ภาระงาน
                      </label>
                      <input
                        name="workload"
                        type="number"
                        placeholder="ภาระงาน"
                        defaultValue={formDetail.workload}
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                        required
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        ประเภทไฟล์หลักฐาน
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div
                          className={`flex items-center justify-center px-4 py-2 rounded-md border-2 text-sm font-light ${evidenceType === "link"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-gray-500"
                            } dark:bg-zinc-800`}
                        >
                          <Link
                            className={`w-4 h-4 mr-2 ${evidenceType !== "link" ? "text-gray-400 dark:text-gray-500" : ""}`}
                          />
                          ลิ้งก์
                        </div>
                        <div
                          className={`flex items-center justify-center px-4 py-2 rounded-md border-2 text-sm font-light ${evidenceType === "external file"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-gray-500"
                            } dark:bg-zinc-800`}
                        >
                          <Upload
                            className={`w-4 h-4 mr-2 ${evidenceType !== "external file" ? "text-gray-400 dark:text-gray-500" : ""}`}
                          />
                          อัปโหลดไฟล์จากเครื่อง
                        </div>
                      </div>
                      <input type="hidden" name="file_type" value={evidenceType} />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        ไฟล์หลักฐาน
                      </label>
                      {/* แสดงส่วนของลิงก์หลายลิงก์ */}
                      {evidenceType === "link" && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {links.map((link, index) => (
                              <div
                                key={link.link_id || `new-link-${index}`}
                                className="flex flex-col space-y-2 p-3 border border-gray-200 dark:border-zinc-700 rounded-md"
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-sm font-medium  ${link.link_id ? "text-gray-600" : "text-green-500"} dark:text-gray-400`}>
                                    ลิงก์ #{index + 1} {link.link_id ? `` : "(ใหม่)"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLink(index)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="ชื่อที่ต้องการแสดง"
                                  value={link.link_name}
                                  onChange={(e) => handleLinkChange(index, "link_name", e.target.value)}
                                  className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                                />
                                <input
                                  type="url"
                                  placeholder="https://example.com"
                                  value={link.link_path}
                                  onChange={(e) => handleLinkChange(index, "link_path", e.target.value)}
                                  className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                                />
                                {link.link_id && <input type="hidden" name={`link_ids[]`} value={link.link_id} />}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleAddLink}
                            className="flex items-center justify-center w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg cursor-pointer transition-colors duration-150 dark:text-blue-400 dark:border-blue-800 dark:hover:border-blue-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            เพิ่มลิงก์
                          </button>
                        </div>
                      )}
                      {evidenceType === "external file" && (
                        <div className="space-y-4">
                          {/* Existing files section */}
                          {existingFiles.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ไฟล์ที่มีอยู่:</p>
                              <ul className="space-y-2">
                                {existingFiles.map((file) => (
                                  <li
                                    key={file.fileinfo_id || `file-${file.form_id}-${file.file_name}`}
                                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-zinc-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    <div className="flex items-center">
                                      {isImageFile(file.file_name) ? (
                                        <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
                                      ) : (
                                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                                      )}
                                      <span>
                                        {file.file_name} ({(file.size / 1024).toFixed(2)} KB)
                                      </span>
                                    </div>
                                    {/* แสดงปุ่มลบเฉพาะเมื่อมีไฟล์มากกว่า 1 ไฟล์ หรือมีไฟล์ที่อัปโหลดใหม่ */}
                                    {existingFiles.length + uploadedFiles.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (file.fileinfo_id) {
                                            console.log(
                                              `Attempting to remove file: ${file.file_name} with ID: ${file.fileinfo_id}`,
                                            )
                                            handleRemoveExistingFile(file.fileinfo_id)
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Upload new files section */}
                          <div
                            {...getRootProps()}
                            className={`w-full py-2 flex flex-col items-center justify-center border-2 border-dashed rounded-md transition-all duration-300 ease-in-out ${isDragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                : "border-gray-300 dark:border-zinc-600 dark:bg-zinc-800"
                              } hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer`}
                          >
                            <input {...getInputProps()} name="workload_file" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {isDragActive ? "วางไฟล์ที่นี่ ..." : "ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">(ขนาดไฟล์ไม่เกิน 10 MB รองรับไฟล์)</p>
                          </div>

                          {/* Newly uploaded files section */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ไฟล์ที่เพิ่ม:</p>
                              <ul className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-zinc-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    <div className="flex items-center">
                                      {isImageFile(file.name) ? (
                                        <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
                                      ) : (
                                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                                      )}
                                      <span>
                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                      </span>
                                    </div>
                                    {/* แสดงปุ่มลบเฉพาะเมื่อมีไฟล์มากกว่า 1 ไฟล์ */}
                                    {existingFiles.length + uploadedFiles.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveUploadedFile(index)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {evidenceType === "file in system" && (
                        <>
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="ชื่อที่ต้องการแสดง"
                              value={fileName}
                              onChange={(e) => setFileName(e.target.value)}
                              className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                            />
                          </div>
                          <input
                            name="workload_file"
                            type="text"
                            placeholder="Enter file path or ID"
                            value={fileInSystem}
                            onChange={(e) => setFileInSystem(e.target.value)}
                            className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      type="submit"
                      className="w-20 bg-amber-500 flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-amber-600 transition ease-in-out duration-300"
                    >
                      บันทึก
                    </button>
                    <label
                      htmlFor={`edit-modal-${form_id}`}
                      onClick={handleCancel}
                      className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                    >
                      ยกเลิก
                    </label>
                  </div>
                </div>
              </form>
            ) : null}
          </div>
          <label className="modal-backdrop" htmlFor={`edit-modal-${form_id}`}>
            Close
          </label>
        </div>
      </div>
    </>
  )
}
