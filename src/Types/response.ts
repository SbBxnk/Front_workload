export type ResponsePayload<T> = {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  payload: T[]

  meta: {
    limit: number
    page: number
    sort: string
    total_pages: number
    total_rows: number
  }
}

// Backend response format for workload form operations
export type BackendResponse<T = any> = {
  status: boolean
  message: string
  data?: T
  error?: string
}


