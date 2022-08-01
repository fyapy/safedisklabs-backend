import { nullable, required } from 'zoply-schema'

export interface Upload {
  diskId: string
}
export const uploadSchema = {
  diskId: required,
}

export interface CreateFolder {
  name: string
  diskId: string
  folderId: string | null
}
export const createFolderSchema = {
  name: required,
  diskId: required,
  folderId: nullable(required),
}
