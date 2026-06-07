'use client'

import { useEditPersonal } from './_partial/useEditPersonal'
import EditPersonalFields from './_partial/EditPersonalFields'

export default function EditPersonal() {
  const editPersonal = useEditPersonal()

  return (
    <form onSubmit={editPersonal.handleSubmit}>
      <div className="w-full space-y-4">
        <EditPersonalFields {...editPersonal} />
      </div>
    </form>
  )
}
