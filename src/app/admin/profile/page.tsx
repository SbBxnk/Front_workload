'use client'

import StickyFooter from '@/components/StickyFooter'
import { useAdminProfile } from './_partial/useAdminProfile'
import AdminProfileFields from './_partial/AdminProfileFields'

export default function EditProfile() {
  const {
    user,
    setUser,
    previewImage,
    isEditing,
    formRef,
    getRootProps,
    getInputProps,
    isDragActive,
    handleSubmit,
    handleEditToggle,
    requestSubmit,
  } = useAdminProfile()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className={isEditing ? 'pb-24' : 'pb-0'}>
      <form onSubmit={handleSubmit} ref={formRef}>
        <AdminProfileFields
          user={user}
          setUser={setUser}
          previewImage={previewImage}
          isEditing={isEditing}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          onEditToggle={handleEditToggle}
        />
      </form>

      {/* Sticky Footer - แสดงเฉพาะตอนแก้ไข */}
      {isEditing && (
        <StickyFooter
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onSave={requestSubmit}
          onCancel={handleEditToggle}
          editText="แก้ไข"
          cancelText="ยกเลิก"
          saveText="บันทึก"
        />
      )}
    </div>
  )
}
