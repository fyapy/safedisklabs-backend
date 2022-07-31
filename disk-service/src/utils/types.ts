import type { isMultipart } from 'fastify-multer/lib/lib/content-parser'
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify'
import type { UserModel, UserService } from 'modules/users'
import type { AuthService } from 'modules/auth'


export type File = import('fastify-multer/lib/interfaces').File
export type FilesInRequest = File[]

declare module 'fastify' {
  interface FastifyRequest {
    userId: number
    isMultipart: typeof isMultipart
    file: File
    files: File[]
  }
}

export interface Models {
  UserModel: typeof UserModel
}
export interface Services {
  Models: Models
  AuthService: ReturnType<typeof AuthService>
  UserService: ReturnType<typeof UserService>
}

export type SetupRoutes = FastifyPluginCallback<{
  services: Services
}>
export type Handler = RouteHandlerMethod
