import { createModel } from 'aurora-orm'

export interface Folder {
  id: string
  name: string
  userId: number
  diskId: string
  folderId: string | null
  hidden: boolean
  updatedAt: string
  createdAt: string
}

export const FolderModel = createModel<Folder>({
  table: 'folders',
  mapping: {
    id: 'id',
    name: 'name',
    userId: 'user_id',
    diskId: 'disk_id',
    folderId: 'folder_id',
    hidden: 'hidden',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
})
