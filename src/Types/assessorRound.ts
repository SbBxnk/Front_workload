export interface AssessorRound {
  round_list_id: number
  round_list_name: string
  round: number
  year: number
  date_start: string
  date_end: string
  total_assessees: number
}

export interface AssessorRoundResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: any
  payload: AssessorRound[]
}
