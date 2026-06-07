export interface SnapshotLink {
  link_name: string
  link_path: string
}

export interface SnapshotFile {
  file_name: string
}

export interface SnapshotRow {
  snapshot_form_id: number
  form_id: number
  task_id: number
  task_name: string
  subtask_id: number
  subtask_name: string
  workload_group_id: number
  workload_group_name: string
  quantity_workload_hours: number | null
  form_title: string
  description: string | null
  workload: number | null
  quality: number | null
  file_type: string | null
  ex_score: number | null
  files: SnapshotFile[]
  links: SnapshotLink[]
}

export interface EvaluationItem {
  evaluation_item_id?: number
  snapshot_form_id: number
  score: number | null
  comment: string | null
  created_at?: string
  updated_at?: string
}

export interface EvaluationPayload {
  evaluation_id: number
  formlist_id: number
  set_asses_info_id: number
  assessor_user_id: number
  assessee_user_id: number
  status: number
  comment: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  round_list_id: number
  set_asses_list_id: number
  items: EvaluationItem[]
}

export interface EvaluationResponse {
  evaluation: EvaluationPayload
  snapshot: SnapshotRow[]
}

export interface SaveDraftRequest {
  comment?: string | null
  items?: Array<{
    snapshot_form_id: number
    score: number | null
    comment: string | null
  }>
}
