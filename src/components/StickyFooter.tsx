import React from 'react'

interface StickyFooterProps {
  isEditing?: boolean
  onEditToggle?: () => void
  onSave?: () => void
  onCancel?: () => void
  editText?: string
  cancelText?: string
  saveText?: string
  className?: string
  // สำหรับ submit ปุ่มเดียว
  onSubmit?: () => void
  submitText?: string
  showSubmitOnly?: boolean
  // สำหรับ preview
  onPreview?: () => void
  previewText?: string
  showPreview?: boolean
}

const StickyFooter: React.FC<StickyFooterProps> = ({
  isEditing,
  onEditToggle,
  onSave,
  onCancel,
  editText = 'แก้ไข',
  cancelText = 'ยกเลิก',
  saveText = 'บันทึก',
  className = '',
  // สำหรับ submit ปุ่มเดียว
  onSubmit,
  submitText = 'ส่งข้อมูล',
  showSubmitOnly = false,
  // สำหรับ preview
  onPreview,
  previewText = 'ดูตัวอย่าง',
  showPreview = false
}) => {
  const handleEditClick = () => {
    if (isEditing && onCancel) {
      onCancel()
    } else {
      onEditToggle?.()
    }
  }

  const handleSaveClick = () => {
    if (onSave) {
      onSave()
    }
  }

  const handleSubmitClick = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview()
    }
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:border-zinc-700 md:left-20 ${className}`}>
      <div className="mx-auto px-4 py-4">
        <div className="flex justify-end gap-3">
          {showSubmitOnly ? (
            <>
              {showPreview && (
                <button
                  type="button"
                  onClick={handlePreviewClick}
                  className="h-10 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  {previewText}
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmitClick}
                className="h-10 px-6 py-2.5 text-sm font-medium text-white bg-success border border-transparent rounded-md hover:bg-success/80 transition-colors duration-200"
              >
                {submitText}
              </button>
            </>
          ) : isEditing ? (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                className="h-10 px-6 py-2.5 text-sm font-medium text-white bg-gray-500 border border-transparent rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="h-10 px-6 py-2.5 text-sm font-medium text-white bg-success border border-transparent rounded-md hover:bg-success/80 transition-colors duration-200"
              >
                {saveText}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className="h-10 px-6 py-2.5 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md hover:bg-amber-600 transition-colors duration-200"
            >
              {editText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickyFooter
