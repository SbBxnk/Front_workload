import React from 'react'

interface StickyFooterProps {
  isEditing: boolean
  onEditToggle: () => void
  onSave?: () => void
  onCancel?: () => void
  editText?: string
  cancelText?: string
  saveText?: string
  className?: string
}

const StickyFooter: React.FC<StickyFooterProps> = ({
  isEditing,
  onEditToggle,
  onSave,
  onCancel,
  editText = 'แก้ไข',
  cancelText = 'ยกเลิก',
  saveText = 'บันทึก',
  className = ''
}) => {
  const handleEditClick = () => {
    if (isEditing && onCancel) {
      onCancel()
    } else {
      onEditToggle()
    }
  }

  const handleSaveClick = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:border-zinc-700 md:left-20 ${className}`}>
      <div className="mx-auto px-4 py-4">
        <div className="flex justify-end gap-3">
          {isEditing ? (
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
