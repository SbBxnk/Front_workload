import { Branch, BranchSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateBranchRequest {
  branch_name: string
}

export interface UpdateBranchRequest {
  branch_name: string
}

const BranchServices = {
  getAllBranches: ( accessToken: string, param: BranchSearchParams ): Promise<ResponsePayload<Branch>> => {
    return http.get('/branch', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param.search,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createBranch: (
    data: CreateBranchRequest,
    accessToken: string
  ): Promise<Branch> => {
    return http.post('/branch/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateBranch: (
    branchId: number,
    data: UpdateBranchRequest,
    accessToken: string
  ): Promise<Branch> => {
    return http.put(`/branch/update/${branchId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteBranch: (branchId: number, accessToken: string): Promise<void> => {
    return http.delete(`/branch/delete/${branchId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getBranchById: (branchId: number, accessToken: string): Promise<Branch> => {
    return http.get(`/branch/${branchId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default BranchServices
