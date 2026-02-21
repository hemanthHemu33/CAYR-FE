import { apiClient } from './api'
import type { LoginRequest, LoginResponse } from '../types/auth'

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const legacyPayload = {
    UserName: payload.userName,
    Password: payload.password,
  }

  return apiClient.postJson<LoginResponse>('/Login/UserLogin', legacyPayload)
}
