'use client'

import { useCreatePersonal } from './_partial/useCreatePersonal'
import PersonalFormFields from './_partial/PersonalFormFields'

export default function CreatePersonal() {
  const form = useCreatePersonal()

  return (
    <form onSubmit={form.handleSubmit}>
      <div className="w-full space-y-4">
        <PersonalFormFields form={form} />
      </div>
    </form>
  )
}
