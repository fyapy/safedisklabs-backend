import type { isMultipart } from 'fastify-multer/lib/lib/content-parser'
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify'
import type { UserModel, UserService } from 'modules/users'
import type { AuthService } from 'modules/auth'
import type {
  DiskModel,
  FileModel,
  FolderModel,
  FolderService,
  FileService,
} from 'modules/disks'
import type { Language } from 'i18n'


export type File = import('fastify-multer/lib/interfaces').File
export type FilesInRequest = File[]

declare module 'fastify' {
  interface FastifyRequest {
    userId: number
    isMultipart: typeof isMultipart
    file: File
    files: File[]
    lang?: Language
  }
}

export interface Models {
  UserModel: typeof UserModel
  DiskModel: typeof DiskModel
  FileModel: typeof FileModel
  FolderModel: typeof FolderModel
}
export interface Services {
  Models: Models
  AuthService: ReturnType<typeof AuthService>
  UserService: ReturnType<typeof UserService>
  FolderService: ReturnType<typeof FolderService>
  FileService: ReturnType<typeof FileService>
}

export type SetupRoutes = FastifyPluginCallback<{
  services: Services
}>
export type Handler = RouteHandlerMethod
