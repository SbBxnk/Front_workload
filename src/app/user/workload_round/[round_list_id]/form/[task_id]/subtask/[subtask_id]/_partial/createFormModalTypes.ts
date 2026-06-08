import type React from 'react'

export interface CreateFormLinkData {
  link_path: string
  link_name: string
}

export interface CreateModalProps {
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string }[],
    fileInSystem?: string,
    fileName?: string
  ) => void
}
