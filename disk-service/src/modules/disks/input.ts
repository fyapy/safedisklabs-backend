import {
  nullable,
  optional,
  required,
} from 'zoply-schema'

export interface ListQuery {
  type?: 'starred' | 'hidden' | 'bin'
  folderId?: string
}

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

export interface Rename {
  id: string
  name: string
}
export const renameSchema = {
  id: required,
  name: required,
}
