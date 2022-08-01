import { Models } from 'utils/types'
import * as input from '../input'

export const FolderService = ({ FolderModel }: Models) => {
  const create = ({ name, diskId, folderId }: input.CreateFolder, userId: number) => FolderModel
    .create({
      name,
      diskId,
      folderId,
      userId,
    })

  return {
    create,
  }
}
