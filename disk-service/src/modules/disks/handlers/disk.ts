import type { SetupRoutes } from 'utils/types'
import { HttpError, zoplyValidate } from 'utils/errors'
import { fromFile } from 'file-type'
import * as storage from 'utils/storage'
import * as input from '../input'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  const getModel = (type: 'file' | 'folder') => type === 'file'
    ? services.Models.FileModel
    : services.Models.FolderModel

  router.route<{ Body: input.CreateFolder }>({
    url: '/create/folder',
    method: 'POST',
    preHandler: zoplyValidate(input.createFolderSchema),
    handler: req => services.FolderService.create(req.body, req.userId),
  })

  router.route<{ Body: input.Upload }>({
    url: '/upload',
    method: 'POST',
    preHandler: [
      storage.fileUpload.single('files'),
      zoplyValidate(input.uploadSchema),
    ],
    handler: async ({ userId, body, file }) => {
      if (!file?.size || !file?.path) {
        throw new HttpError(400, 'FILE_NOT_FOUND')
      }

      const mime = await fromFile(file.path)

      // const { message } = await services.dialogService.uploadPhoto(body, userId, file)

      console.log(body.diskId, userId)
      console.log(file, mime)

      return {}
    },
  })

  router.route<{ Body: input.ToggleHidden }>({
    url: '/toggle-hidden',
    method: 'POST',
    preHandler: zoplyValidate(input.toggleHiddenSchema),
    handler: ({ userId, body }) => services.DiskService.toggleHidden(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.ToggleHidden }>({
    url: '/toggle-starred',
    method: 'POST',
    preHandler: zoplyValidate(input.toggleHiddenSchema),
    handler: ({ userId, body }) => services.DiskService.toggleStarred(body, userId, getModel(body.type)),
  })

  router.route<{ Body: input.Rename }>({
    url: '/rename',
    method: 'POST',
    preHandler: zoplyValidate(input.renameSchema),
    handler: ({ userId, body }) => services.DiskService.rename(body, userId, getModel(body.type)),
  })

  done()
}
