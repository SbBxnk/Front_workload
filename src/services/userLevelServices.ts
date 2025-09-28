import { UserLevel, ResponsePayload } from '@/Types'
import http from '@/utils/http'

const UserLevelServices = {
  getAllUserLevels: (accessToken: string): Promise<ResponsePayload<UserLevel>> => {
    return http.get('/level', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }
}

export default UserLevelServices
