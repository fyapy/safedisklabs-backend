import type { FastifyPluginCallback as Cb } from 'fastify'
import type { Models, Services } from 'utils/types'
import * as users from 'modules/users'
import * as disks from 'modules/disks'
import * as auth from 'modules/auth'

export const RoutesPlugin = (): {
  Models: Models
  services: Services
  plugin: Cb
} => {
  const Models: Models = {
    UserModel: users.UserModel,
    FileModel: disks.FileModel,
    DiskModel: disks.DiskModel,
    FolderModel: disks.FolderModel,
  }

  const services: Services = {
    Models,

    UserService: users.UserService(Models),
    AuthService: auth.AuthService(Models),
    DiskService: disks.DiskService(Models),
    FileService: disks.FileService(Models),
    FolderService: disks.FolderService(Models),
  }

  return {
    Models,
    services,
    plugin: (fastify, _, done) => {
      fastify.register(disks.diskRoutes, { prefix: '/disks', services })
      fastify.register(disks.fileRoutes, { prefix: '/files', services })
      fastify.register(auth.setupRoutes, { prefix: '/auth', services })
      fastify.register(users.setupRoutes, { prefix: '/users', services })

      fastify.get('/status', async () => ({ ok: 'OK!' }))

      done()
    },
  }
}
