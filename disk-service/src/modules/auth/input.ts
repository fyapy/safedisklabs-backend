import { required, email } from 'zoply-schema'

export interface Login {
  username: string
  password: string
}
export const loginSchema = {
  username: required,
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
