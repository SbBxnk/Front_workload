'use client'

import { useRef } from 'react'
import StickyFooter from '@/components/StickyFooter'
import { useUserProfile } from './_partial/useUserProfile'
import UserProfileFields from './_partial/UserProfileFields'

export default function EditProfile() {
  const formRef = useRef<HTMLFormElement>(null)
  const {
    user,
    previewImage,
    isEditing,
    getRootProps,
    getInputProps,
    isDragActive,
    setUserField,
    handleSubmit,
    handleEditToggle,
  } = useUserProfile()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className={isEditing ? 'pb-24' : 'pb-0'}>
      <form onSubmit={handleSubmit} ref={formRef}>
        <UserProfileFields
          user={user}
          previewImage={previewImage}
          isEditing={isEditing}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          setUserField={setUserField}
          handleEditToggle={handleEditToggle}
        />
      </form>

      {/* Sticky Footer - แสดงเฉพาะตอนแก้ไข */}
      {isEditing && (
        <StickyFooter
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onSave={() => {
            if (formRef.current) {
              formRef.current.requestSubmit()
            }
          }}
          onCancel={handleEditToggle}
          editText="แก้ไข"
          cancelText="ยกเลิก"
          saveText="บันทึก"
        />
      )}
    </div>
  )
}
