export type LoginRequest = {
  userName: string
  password: string
}

export type LoginResponse = {
  success: boolean
  message?: string
  command?: 'ShowDBList' | string
}
