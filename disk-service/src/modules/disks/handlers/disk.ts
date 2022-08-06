import type { JustId, SetupRoutes } from 'utils/types'
import { HttpError, zoplyValidate } from 'utils/errors'
import * as storage from 'utils/storage'
import { authPreHandler } from 'modules/auth'
import * as input from '../input'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  const auth = authPreHandler(services.Models)
  const getModel = (type: 'file' | 'folder') => type === 'file'
    ? services.Models.FileModel
    : services.Models.FolderModel

  router.route<{
    Querystring: {
      type?: 'starred' | 'hidden' | 'bin'
    }
  }>({
    url: '/list',
    method: 'GET',
    preHandler: auth(),
    handler: req => services.DiskService.list(req.userId, req.query.type),
  })

  router.route<{ Body: input.CreateFolder }>({
    url: '/create-folder',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.createFolderSchema)],
    handler: req => services.FolderService.create(req.body, req.userId),
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

  router.route<{ Body: input.ToggleHidden }>({
    url: '/toggle-hidden',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.toggleHiddenSchema)],
    handler: ({ userId, body }) => services.DiskService.toggleHidden(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.ToggleHidden }>({
    url: '/toggle-starred',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.toggleHiddenSchema)],
    handler: ({ userId, body }) => services.DiskService.toggleStarred(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.ToggleHidden }>({
    url: '/toggle-shared',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.toggleHiddenSchema)],
    handler: ({ userId, body }) => services.DiskService.toggleShared(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.ToggleHidden }>({
    url: '/move-to-bin',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.toggleHiddenSchema)],
    handler: ({ userId, body }) => services.DiskService.moveToBin(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.Rename }>({
    url: '/rename',
    method: 'POST',
    preHandler: [auth(), zoplyValidate(input.renameSchema)],
    handler: ({ userId, body }) => services.DiskService.rename(body, userId, getModel(body.type)),
  })

  done()
}
