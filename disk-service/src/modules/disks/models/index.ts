import { FileModel } from './file'
import { FolderModel } from './folder'

export * from './disk'
export * from './file'
export * from './folder'

export type FileOrFolderModel = typeof FolderModel | typeof FileModel
