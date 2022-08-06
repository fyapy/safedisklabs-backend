import type { File, Models } from 'utils/types'
import * as storage from 'utils/storage'
import { BadRequest, NotFound } from 'utils/errors'
import { Increment, IsNull } from 'aurora-orm'
import * as input from '../input'
import { FileOrFolderModel } from '../models'

export const DiskService = ({ DiskModel, FileModel, FolderModel }: Models) => {
  async function userHavePermission(diskId: string, userId: number) {
    if (!diskId) {
      throw new BadRequest('FILE_NOT_FOUND_2')
    }

    const isExist = await DiskModel.exists({
      id: diskId,
      userId,
    })

    if (!isExist) {
      throw new BadRequest('DISK_PERMISSION')
    }
  }

  async function details(id: string, userId: number) {
    let fileInDb: any = await FileModel.findOne(id)
    let type = 'file'
    if (!fileInDb) {
      fileInDb = await FolderModel.findOne(id)
      type = 'folder'
    }

    if (!fileInDb) {
      throw new NotFound('FILE_NOT_FOUND_3')
    }

    await userHavePermission(fileInDb.diskId, userId)

    return {
      data: fileInDb,
      type,
    }
  }

  async function toggleHidden({ id }: input.ToggleHidden, userId: number, model: FileOrFolderModel) {
    const folderInDb = await model.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await model.update({
      where: id,
      set: {
        hidden: !folderInDb.hidden,
      },
    })
    return {}
  }

  async function toggleStarred({ id }: input.ToggleHidden, userId: number, model: FileOrFolderModel) {
    const folderInDb = await model.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await model.update({
      where: id,
      set: {
        starred: !folderInDb.starred,
      },
    })

    return {
      value: !folderInDb.starred,
    }
  }

  async function moveToBin({ id }: input.ToggleHidden, userId: number, model: FileOrFolderModel) {
    const folderInDb = await model.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    if (!folderInDb.bin) {
      await model.update({
        where: id,
        set: {
          bin: true,
        },
      })
    } else {
      await storage.minIoRemoveFile(id)
      await model.delete(id)
    }

    return {}
  }

  async function rename({ id, name }: input.Rename, userId: number, model: FileOrFolderModel) {
    const folderInDb = await model.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await model.update({
      where: id,
      set: {
        name,
      },
    })
    return {}
  }

  async function toggleShared({ id }: input.ToggleHidden, userId: number, model: FileOrFolderModel) {
    const folderInDb = await model.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await model.update({
      where: id,
      set: {
        shared: !folderInDb.shared,
      },
    })
    return {
      value: !folderInDb.shared,
    }
  }

  async function _uploadFile({ userId, body, file }: {
    body: input.Upload
    file: File
    userId: number
  }) {
    const { ext, mime, size } = await storage.mimeType(file)
    const disk = await DiskModel.findOne(body.diskId)

    if (mime === null || ext === null) {
      throw new BadRequest('UNKNOWN_FILE_TYPE')
    }
    if (disk.usedSize + size > disk.maxSize) {
      throw new BadRequest('NOT_ENOUGH_DISK_SPACE')
    }

    const fileInDb = await FileModel.create({
      diskId: body.diskId,
      ext,
      folderId: body.folderId ?? null,
      mime,
      name: file.originalname,
      size,
      userId,
    })
    await storage.minIoPutFile(fileInDb.id, file)
    await DiskModel.update({
      where: body.diskId,
      set: {
        usedSize: Increment(size),
      },
    })

    return fileInDb
  }
  async function upload({ fileList, body, userId }: {
    body: input.Upload
    fileList: File[]
    userId: number
  }) {
    const list = await Promise.all(fileList.map(file => _uploadFile({
      file,
      body,
      userId,
    })))

    return {
      list,
    }
  }

  async function list(userId: number, type?: 'starred' | 'hidden' | 'bin') {
    const starred = type === 'starred'
    const hidden = type === 'hidden'
    const bin = type === 'bin'
    const tx = await FileModel.getConnect()

    try {
      const disk = await DiskModel.findOne({
        where: { userId },
        tx,
      })
      const [folders, files] = await Promise.all([
        FolderModel.findAll({
          where: {
            diskId: disk.id,
            ...(starred ? { starred } : {}),
            hidden,
            bin,
            folderId: IsNull(),
          },
          tx,
        }),
        FileModel.findAll({
          where: {
            diskId: disk.id,
            ...(starred ? { starred } : {}),
            hidden,
            bin,
            folderId: IsNull(),
          },
          tx,
        }),
      ])

      return {
        data: disk,
        list: {
          folders,
          files,
        },
      }
    } catch (e) {
      throw e
    } finally {
      tx.release()
    }
  }

  return {
    toggleHidden,
    toggleStarred,
    rename,
    upload,
    list,
    moveToBin,
    toggleShared,
    details,
  }
}
