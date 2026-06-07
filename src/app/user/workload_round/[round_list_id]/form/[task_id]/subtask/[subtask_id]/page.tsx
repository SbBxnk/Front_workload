'use client'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import CreateFormModal from './_partial/CreateFormModal'
import DeleteFormModal from './_partial/DeleteFormModal'
import EditFormModal from './_partial/EditFormModal'
import FormItemCard from './_partial/FormItemCard'
import SubtaskFormSkeleton from './_partial/SubtaskFormSkeleton'
import { useSubtaskFormData } from './_partial/useSubtaskFormData'
import { useSubtaskFormActions } from './_partial/useSubtaskFormActions'

function WorkloadSubtaskInfo() {
  const {
    subtask_id,
    session,
    subtask,
    subtaskIndex,
    loading,
    error,
    userId,
    workloadGroupInfo,
    formList,
    setFormList,
    fileInfos,
    formFiles,
    setFormFiles,
    formLinks,
    setFormLinks,
    formSystemFiles,
    setFormSystemFiles,
    setFormFileNames,
    isOpen,
    setIsOpen,
  } = useSubtaskFormData()

  const [dropdownOpen, setDropdownOpen] = useState<{
    [index: number]: boolean
  }>({})

  const {
    editFormId,
    formDetail,
    handleAddDisplayForm,
    handleEditForm,
    handleViewEvidence,
    handleDelete,
    handleEdit,
    comfirmDelete,
  } = useSubtaskFormActions({
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
  })

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
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleForm = (index: number) => {
    setIsOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const totalSum = formList.reduce((sum, form) => sum + form.total_score, 0)

  if (loading) {
    return <SubtaskFormSkeleton />
  }

  if (error) return <div className="text-red-500">{error}</div>
  if (!subtask || !subtaskIndex) return null

  return (
    <>
      <CreateFormModal onSubmit={handleAddDisplayForm} />
      <EditFormModal
        form_id={editFormId}
        formDetail={formDetail}
        onSubmit={handleEditForm}
      />
      {formList.filter(form => form && form.form_id !== null && form.form_id !== undefined).map((form, index) => (
        <DeleteFormModal
          key={form.form_id ? `delete-modal-${form.form_id}` : `delete-modal-temp-${index}`}
          comfirmDelete={comfirmDelete}
          form_id={form.form_id}
        />
      ))}

      <div className="">
        <div className="rounded-t-lg bg-white p-4 shadow-lg dark:bg-zinc-900 dark:text-gray-300">
          <div className="space-y-6">
            <h1 className="text-[16px] font-normal text-business1 dark:text-blue-400 md:text-2xl">
              {subtaskIndex} {subtask.subtask_name}
            </h1>
            {formList.filter(form => form && form.form_id !== null && form.form_id !== undefined).map((form, index) => (
              <FormItemCard
                key={form.form_id ? `form-${form.form_id}` : `form-temp-${index}`}
                form={form}
                index={index}
                subtaskIndex={subtaskIndex}
                isOpen={isOpen[index]}
                dropdownOpen={dropdownOpen[index]}
                formFiles={formFiles}
                formLinks={formLinks}
                formSystemFiles={formSystemFiles}
                fileInfos={fileInfos}
                toggleForm={toggleForm}
                toggleDropdown={toggleDropdown}
                closeDropdown={closeDropdown}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleViewEvidence={handleViewEvidence}
              />
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 flex w-full flex-col justify-end gap-[16px] rounded-b-lg bg-white p-4 shadow-lg dark:bg-zinc-900 dark:text-gray-300">
          <div
            className={`${totalSum === 0 ? 'bg-gray-100' : 'bg-green-100'} rounded-lg px-4 py-3 dark:bg-zinc-700`}
          >
            <p className="text-md font-light text-gray-700 dark:text-gray-300">
              ผลรวมคะแนนรวมทั้งหมด:{' '}
              <span className="font-normal">{totalSum}</span>
            </p>
          </div>
          <label
            htmlFor={`modal-forminfo`}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-400 hover:text-gray-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:hover:border-zinc-500">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มรายละเอียดภาระงาน
          </label>
        </div>
      </div>
    </>
  )
}

export default WorkloadSubtaskInfo
