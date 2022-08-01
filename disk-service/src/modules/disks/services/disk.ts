import type { Models } from 'utils/types'
import { BadRequest } from 'utils/errors'
import * as input from '../input'

export function DiskService({ FolderModel, FileModel, DiskModel }: Models) {
  async function userHavePermission(diskId: string, userId: number) {
    const isExist = await DiskModel.exists({
      id: diskId,
      userId,
    })

    if (!isExist) {
      throw new BadRequest('DISK_PERMISSION')
    }
  }

  async function toggleHidden({ id, type }: input.ToggleHidden, userId: number) {
    if (type === 'file') {
      const fileInDb = await FileModel.findOne(id)
      await userHavePermission(fileInDb.diskId, userId)

      await FileModel.update({
        where: id,
        set: {
          hidden: !fileInDb.hidden,
        },
      })
      return {}
    }

    const folderInDb = await FolderModel.findOne(id)
    await userHavePermission(folderInDb.diskId, userId)

    await FolderModel.update({
      where: id,
      set: {
        hidden: !folderInDb.hidden,
      },
    })
    return {}
  }

  return {
    toggleHidden,
  }
}
