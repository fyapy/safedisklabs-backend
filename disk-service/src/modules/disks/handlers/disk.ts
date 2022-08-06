import type { JustId, SetupRoutes } from 'utils/types'
import { HttpError, zoplyValidate } from 'utils/errors'
import * as storage from 'utils/storage'
import { authPreHandler } from 'modules/auth'
import * as input from '../input'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  const auth = authPreHandler(services.Models)

  router.route<{ Querystring: input.ListQuery }>({
    url: '/list',
    method: 'GET',
    preHandler: auth(),
    handler: req => services.DiskService.list(req.userId, req.query),
  })

  router.route<{ Body: input.CreateFolder }>({
    url: '/create-folder',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.createFolderSchema)],
    handler: req => services.DiskService.createFolder(req.body, req.userId),
  })

  router.route<{ Body: input.Upload }>({
    url: '/upload',
    method: 'POST',
    preHandler: [
      auth(),
      storage.fileUpload.any(),
      zoplyValidate(input.uploadSchema),
    ],
    handler({ userId, body, file, files }) {
      const fileList = storage.reqToFile({ file, files })

      if (fileList.length === 0) {
        throw new HttpError(400, 'FILE_NOT_FOUND')
      }

      return services.DiskService.upload({
        body,
        userId,
        fileList,
      })
    },
  })

  router.route<{ Params: JustId }>({
    url: '/details/:id',
    method: 'GET',
    preHandler: auth(),
    handler: ({ userId, params }) => services.DiskService.details(params.id, userId),
  })

  router.route<{ Params: JustId }>({
    url: '/toggle-hidden/:id',
    method: 'POST',
    preHandler: auth(),
    handler: ({ userId, params }) => services.DiskService.toggleHidden(params.id, userId),
  })

  router.route<{ Params: JustId }>({
    url: '/toggle-starred/:id',
    method: 'POST',
    preHandler: auth(),
    handler: ({ userId, params }) => services.DiskService.toggleStarred(params.id, userId),
  })

  router.route<{ Params: JustId }>({
    url: '/toggle-shared/:id',
    method: 'POST',
    preHandler: auth(),
    handler: ({ userId, params }) => services.DiskService.toggleShared(params.id, userId),
  })

  router.route<{ Params: JustId }>({
    url: '/move-to-bin/:id',
    method: 'POST',
    preHandler: auth(),
    handler: ({ userId, params }) => services.DiskService.moveToBin(params.id, userId),
  })

  router.route<{ Body: input.Rename }>({
    url: '/rename',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.renameSchema)],
    handler: ({ userId, body }) => services.DiskService.rename(body, userId),
  })

  done()
}
