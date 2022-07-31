import { required, optional, email } from 'zoply-schema'

export interface Login {
  username?: string
  email?: string
  password: string
}
export const loginSchema = {
  username: optional(required),
  email: optional(required),
  password: required,
}

export interface Register {
  username: string
  email: string
  password: string
}
export const registerSchema = {
  username: required,
  email: [required, email],
  password: required,
}
