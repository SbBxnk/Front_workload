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


