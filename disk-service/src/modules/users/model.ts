import { createModel } from 'aurora-orm'

export interface User {
  id: number
  username: string
  email: string
  hash?: string
  blockedAt?: string | null
  updatedAt: string
  createdAt: string
}

export const UserModel = createModel<User>({
  table: 'users',
  mapping: {
    id: 'id',
    username: 'username',
    email: 'email',
    hash: {
      name: 'hash',
      hidden: true,
    },
    blockedAt: {
      name: 'blocked_at',
      hidden: true,
    },
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
})
