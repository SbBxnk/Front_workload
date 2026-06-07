import { UserLevel, ResponsePayload } from '@/Types'
import http from '@/utils/http'

const UserLevelServices = {
  getAllUserLevels: (): Promise<ResponsePayload<UserLevel>> => {
    return http.get('/level')
  }
}

export default UserLevelServices
