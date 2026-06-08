import type { SnapshotRow } from '@/Types/workloadEvaluation'

// ----- form1 (workload evaluation) -----
export interface Form1ItemDraft {
    snapshot_form_id: number
    score: string
    comment: string
}

export interface StructuredSubtask {
    subtask_id: number
    subtask_name: string
    form_infos: SnapshotRow[]
}

export interface StructuredTask {
    task_id: number
    task_name: string
    quantity_workload_hours: number | null | undefined
    subtasks: StructuredSubtask[]
}

export interface Component1ContentProps {
    formlistIdParam: string
    setAssesInfoIdParam: string
    accessToken: string
}

// ----- form2 (performance evaluation assessment) -----
export interface Form2ItemDraft {
    competency_id: number
    assessed_level: number | null
    comment: string
}

export interface Component2ContentProps {
    formlistIdParam: string
    setAssesInfoIdParam: string
    accessToken: string
    roundListId?: number
    assesseeUserId?: number
}

export const formatThaiDateTime = (date?: Date | null) => {
    if (!date) return '-'
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
