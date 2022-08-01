import { createModel } from 'aurora-orm'

export interface Disk {
  id: string
  userId: number
  maxSize: number
  usedSize: number
  updatedAt: string
  createdAt: string
}

export const DiskModel = createModel<Disk>({
  table: 'disks',
  mapping: {
    id: 'id',
    userId: 'user_id',
    maxSize: 'max_size',
    usedSize: 'used_size',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
})
