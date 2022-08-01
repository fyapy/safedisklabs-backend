import { createModel } from 'aurora-orm'

export interface File {
  id: string
  name: string
  size: number
  exp: string | null
  mime: string | null
  userId: number
  diskId: string
  folderId: string | null
  hidden: boolean
  updatedAt: string
  createdAt: string
}

export const FileModel = createModel<File>({
  table: 'files',
  mapping: {
    id: 'id',
    name: 'name',
    size: 'size',
    exp: 'exp',
    mime: 'mime',
    userId: 'user_id',
    diskId: 'disk_id',
    folderId: 'folder_id',
    hidden: 'hidden',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
})
