import type { Models } from 'utils/types'
import { NotFound } from 'utils/errors'

export const FileService = ({ FileModel }: Models) => {
  async function view(id: string) {
    const file = await FileModel.findOne(id)

    if (!file) {
      throw new NotFound('FILE_NOT_FOUND')
    }

    return file
  }

  return {
    view,
  }
}
