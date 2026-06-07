import type {
  Branch,
  BranchSearchParams,
  CreateBranchRequest,
  UpdateBranchRequest,
  ResponsePayload,
} from '@/Types'
import http from '@/utils/http'

const BranchServices = {
  getAllBranches: (
    params: BranchSearchParams
  ): Promise<ResponsePayload<Branch>> => http.get('/branch', { params }),

  getBranchById: (branchId: number): Promise<Branch> =>
    http.get(`/branch/${branchId}`),

  createBranch: (data: CreateBranchRequest): Promise<Branch> =>
    http.post('/branch/add', data),

  updateBranch: (
    branchId: number,
    data: UpdateBranchRequest
  ): Promise<Branch> => http.put(`/branch/update/${branchId}`, data),

  deleteBranch: (branchId: number): Promise<void> =>
    http.delete(`/branch/delete/${branchId}`),
}

export default BranchServices
