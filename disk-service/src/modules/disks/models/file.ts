import { createModel } from 'aurora-orm'

export interface File {
  id: string
  name: string
  size: number
  ext: string | null
  mime: string | null
  userId: number
  diskId: string
  folderId: string | null
  hidden: boolean
  shared: boolean
  bin: boolean
  starred: boolean
  updatedAt: string
  createdAt: string
}

export const FileModel = createModel<File>({
  table: 'files',
  mapping: {
    id: 'id',
    name: 'name',
    size: 'size',
    ext: 'ext',
    mime: 'mime',
    userId: 'user_id',
    diskId: 'disk_id',
    folderId: 'folder_id',
    hidden: 'hidden',
    shared: 'shared',
    bin: 'bin',
    starred: 'starred',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
})
