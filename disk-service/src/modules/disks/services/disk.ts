import type { File, Models } from 'utils/types'
import {
  Decrement,
  Increment,
  IsNull,
  Tx,
} from 'aurora-orm'
import * as storage from 'utils/storage'
import { BadRequest, NotFound } from 'utils/errors'
import { File as FileModelType } from '../models'
import * as input from '../input'

export const DiskService = ({ DiskModel, FileModel, MetaModel }: Models) => {
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
    const fileInDb = await FileModel.findOne({
      where: id,
      join: ['meta'],
    })
    if (!fileInDb) {
      throw new NotFound('FILE_NOT_FOUND_3')
    }

    await userHavePermission(fileInDb.diskId, userId)

    return {
      data: fileInDb,
    }
  }

  async function toggleHidden(id: string, userId: number) {
    const folderInDb = await FileModel.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await FileModel.update({
      where: id,
      set: {
        hidden: !folderInDb.hidden,
      },
    })

    return {}
  }

  async function toggleStarred(id: string, userId: number) {
    const folderInDb = await FileModel.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await FileModel.update({
      where: id,
      set: {
        starred: !folderInDb.starred,
      },
    })

    return {
      value: !folderInDb.starred,
    }
  }

  async function moveToBin(id: string, userId: number) {
    const folderInDb = await FileModel.findOne({
      where: id,
      join: ['meta'],
    })

    await userHavePermission(folderInDb.diskId, userId)

    if (!folderInDb.bin) {
      await FileModel.update({
        where: id,
        set: {
          bin: true,
        },
      })
    } else {
      await storage.minIoRemoveFile(id)
      await FileModel.delete(id)

      if (folderInDb.meta) {
        await DiskModel.update({
          where: folderInDb.diskId,
          set: {
            usedSize: Decrement(folderInDb.meta.size),
          },
        })
      }
    }

    return {}
  }

  async function rename({ id, name }: input.Rename, userId: number) {
    const folderInDb = await FileModel.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await FileModel.update({
      where: id,
      set: {
        name,
      },
    })

    return {}
  }

  async function toggleShared(id: string, userId: number) {
    const folderInDb = await FileModel.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await FileModel.update({
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
      type: 'file',
      diskId: body.diskId,
      folderId: body.folderId ?? null,
      name: file.originalname,
      userId,
    })
    fileInDb.meta = await MetaModel.create({
      fileId: fileInDb.id,
      ext,
      mime,
      size,
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

  async function folderPaths(folderId: string | undefined, tx: Tx) {
    console.log(1, folderId)

    if (!folderId) return []

    const paths: FileModelType[] = []
    let currentFolderId: string | null = folderId

    while (currentFolderId) {
      const folder = await FileModel.findOne({
        where: {
          id: currentFolderId,
          type: 'folder',
        },
        select: ['name', 'shared', 'id', 'folderId'],
        tx,
      })

      currentFolderId = folder.folderId
      paths.push(folder)
    }

    return paths.reverse()
  }
  async function list(userId: number, { type, folderId }: input.ListQuery) {
    const starred = type === 'starred'
    const hidden = type === 'hidden'
    const bin = type === 'bin'
    const tx = await FileModel.getConnect()

    try {
      const disk = await DiskModel.findOne({
        where: {
          userId,
        },
        tx,
      })
      const [list, paths] = await Promise.all([
        FileModel.findAll({
          where: {
            diskId: disk.id,
            ...(starred ? { starred } : {}),
            hidden,
            bin,
            folderId: folderId || IsNull(),
          },
          join: ['meta'],
          tx,
        }),
        folderPaths(folderId, tx),
      ])

      return {
        data: disk,
        list,
        paths,
      }
    } catch (e) {
      throw e
    } finally {
      tx.release()
    }
  }

  async function createFolder({ name, diskId, folderId }: input.CreateFolder, userId: number) {
    const data = await FileModel.create({
      type: 'folder',
      name,
      diskId,
      folderId,
      userId,
    })

    return {
      data,
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
    createFolder,
    details,
  }
}
