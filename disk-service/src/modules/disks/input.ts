import { nullable, oneOf, required } from 'zoply-schema'

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

export interface ToggleHidden {
  id: string
  type: 'folder' | 'file'
}
export const toggleHiddenSchema = {
  id: required,
  type: oneOf(['folder', 'file']),
}
