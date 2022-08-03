import {
  oneOf,
  nullable,
  optional,
  required,
} from 'zoply-schema'

export interface Upload {
  diskId: string
  folderId?: string
}
export const uploadSchema = {
  diskId: required,
  folderId: optional(required),
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

export interface Rename {
  id: string
  name: string
  type: 'folder' | 'file'
}
export const renameSchema = {
  id: required,
  name: required,
  type: oneOf(['folder', 'file']),
}
