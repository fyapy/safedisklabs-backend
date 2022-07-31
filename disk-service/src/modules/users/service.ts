import { Models } from 'utils/types'

export function UserService({ UserModel }: Models) {
  async function getUser(userId: number) {
    const userInDb = await UserModel.findOne(userId)

    if (!userInDb) {
      throw new Error('Пользователь не найден')
    }

    return {
      user: userInDb,
    }
  }

  return {
    getUser,
  }
}
