"use client"

import type React from "react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { X, Link, Upload, CalendarClock } from "lucide-react"

interface CreateModalProps {
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    link?: string,
    fileInSystem?: string,
    fileName?: string,
  ) => void
}

export default function CreateModal({ onSubmit }: CreateModalProps) {
  const [evidenceType, setEvidenceType] = useState<"link" | "external file" | "file in system">("link")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [link, setLink] = useState<string>("")
  const [fileInSystem, setFileInSystem] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    },
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
  })

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(
      event,
      uploadedFiles,
      evidenceType === "link" ? link : undefined,
      evidenceType === "file in system" ? fileInSystem : undefined,
      evidenceType === "link" || evidenceType === "file in system" ? fileName : undefined,
    )
    setUploadedFiles([])
    setLink("")
    setFileInSystem("")
    setFileName("")
    setEvidenceType("link")
    event.currentTarget.reset()
  }

  const handleEvidenceTypeChange = (type: "link" | "external file" | "file in system") => {
    setEvidenceType(type)
    setUploadedFiles([])
    setLink("")
    setFileInSystem("")
    setFileName("")
  }

  return (
    <>
      <div className="relative z-[100]">
        <input type="checkbox" id={`modal-forminfo`} className="modal-toggle" />
        <div className="modal" role={`modal-forminfo`}>
          <div className="modal-box rounded-md dark:bg-zinc-800">
            <div className="flex items-center mb-4">
              <CalendarClock className="text-blue-500 dark:text-blue-400 mr-2 w-7 h-7" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 truncate">
                เพิ่มรายละเอียดภาระงาน
              </h3>
            </div>
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
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">คำอธิบาย</label>
                  <textarea
                    name="description"
                    placeholder="คำอธิบาย"
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">จำนวน</label>
                  <input
                    name="quality"
                    type="number"
                    placeholder="จำนวน"
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">ภาระงาน</label>
                  <input
                    name="workload"
                    type="number"
                    placeholder="ภาระงาน"
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                    ประเภทไฟล์หลักฐาน
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label
                      className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-all duration-300 ease-in-out text-sm font-light text-gray-600 dark:text-gray-400 dark:bg-zinc-800 ${evidenceType === "link"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-300 dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name="file_type"
                        value="link"
                        checked={evidenceType === "link"}
                        onChange={() => handleEvidenceTypeChange("link")}
                        className="hidden"
                      />
                      <Link className="w-4 h-4 mr-2" />
                      ลิ้งก์
                    </label>
                    <label
                      className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-all duration-300 ease-in-out text-sm font-light text-gray-600 dark:text-gray-400 dark:bg-zinc-800 ${evidenceType === "external file"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-300 dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name="file_type"
                        value="external file"
                        checked={evidenceType === "external file"}
                        onChange={() => handleEvidenceTypeChange("external file")}
                        className="hidden"
                      />
                      <Upload className="w-4 h-4 mr-2" />
                      อัปโหลดไฟล์จากเครื่อง
                    </label>
                    {/* <label
                      className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-all duration-300 ease-in-out text-sm font-light text-gray-600 dark:text-gray-400 dark:bg-zinc-800 ${evidenceType === "file in system"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name="file_type"
                        value="file in system"
                        checked={evidenceType === "file in system"}
                        onChange={() => handleEvidenceTypeChange("file in system")}
                        className="hidden"
                      />
                      <UploadCloud className="w-4 h-4 mr-2" />
                      ไฟล์ในระบบ
                    </label> */}
                  </div>
                  <input type="hidden" name="file_type" value={evidenceType} />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                    ไฟล์หลักฐาน
                  </label>
                  {(evidenceType === "link" || evidenceType === "file in system") && (
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="ชื่อที่ต้องการแสดง"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      />
                    </div>
                  )}
                  {evidenceType === "link" && (
                    <input
                      name="workload_file"
                      type="url"
                      placeholder="https://example.com"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    />
                  )}
                  {evidenceType === "external file" && (
                    <div className="space-y-4">
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
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          (ขนาดไฟล์ไม่เกิน 10 MB รองรับไฟล์)
                        </p>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ไฟล์ที่เพิ่ม:</p>
                          <ul className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 dark:bg-zinc-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span>
                                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(file)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {evidenceType === "file in system" && (
                    <input
                      name="workload_file"
                      type="text"
                      placeholder="Enter file path or ID"
                      value={fileInSystem}
                      onChange={(e) => setFileInSystem(e.target.value)}
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="submit"
                  className="w-20 bg-success flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-success hover:text-white hover:bg-success/80 transition ease-in-out duration-300"
                >
                  ยืนยัน
                </button>
                <label
                  htmlFor={`modal-forminfo`}
                  className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                >
                  ยกเลิก
                </label>
              </div>
            </div>
            </form>
          </div>
          <label className="modal-backdrop" htmlFor={`modal-forminfo`}>
            Close
          </label>
        </div>
      </div>
    </>
  )
}
