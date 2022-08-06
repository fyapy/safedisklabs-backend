import { createModel, JoinStrategies } from 'aurora-orm'

export type FileType = 'file' | 'folder'
export interface File {
  id: string
  name: string
  type: FileType
  userId: number
  diskId: string
  folderId: string | null
  hidden: boolean
  shared: boolean
  bin: boolean
  starred: boolean
  meta?: Meta
  updatedAt: string
  createdAt: string
}
export interface Meta {
  id: string
  fileId: string
  size: number
  ext: string | null
  mime: string | null
}

export const MetaModel = createModel<Meta>({
  table: 'metas',
  mapping: {
    id: 'id',
    fileId: 'file_id',
    size: 'size',
    mime: 'mime',
    ext: 'ext',
  },
})
export const FileModel = createModel<File, 'meta'>({
  table: 'files',
  mapping: {
    id: 'id',
    name: 'name',
    type: 'type',
    userId: 'user_id',
    diskId: 'disk_id',
    folderId: 'folder_id',
    hidden: 'hidden',
    shared: 'shared',
    bin: 'bin',
    starred: 'starred',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    meta: JoinStrategies.OneToOne({
      table: 'metas',
      referenceProp: 'fileId',
      foreignProp: 'id',
    }),
  },
})
