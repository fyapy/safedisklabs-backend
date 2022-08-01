import type { Models } from 'utils/types'
import { BadRequest } from 'utils/errors'
import * as input from '../input'
import { FileOrFolderModel } from '../models'

export const DiskService = ({ DiskModel, FileModel, FolderModel }: Models) => {
  async function userHavePermission(diskId: string, userId: number) {
    const isExist = await DiskModel.exists({
      id: diskId,
      userId,
    })

    if (!isExist) {
      throw new BadRequest('DISK_PERMISSION')
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

  async function list(userId: number) {
    const tx = await FileModel.getConnect()

    try {
      const folders = await FolderModel.findOne({ userId, folderId: null })
      const files = await FileModel.findOne({ userId, folderId: null })

      return {
        folders,
        files,
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
    list,
  }
}
