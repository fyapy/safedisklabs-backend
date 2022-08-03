import { Models } from 'utils/types'
import * as input from '../input'

export const FolderService = ({ FolderModel }: Models) => {
  async function create({ name, diskId, folderId }: input.CreateFolder, userId: number) {
    const data = await FolderModel.create({
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
    create,
  }
}
