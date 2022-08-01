import { Models } from 'utils/types'
import * as input from '../input'

export function FolderService({ FolderModel }: Models) {
  async function create({ name, diskId, folderId }: input.CreateFolder, userId: number) {
    await FolderModel.create({
      name,
      diskId,
      folderId,
      userId,
    })
  }

  return {
    create,
  }
}
