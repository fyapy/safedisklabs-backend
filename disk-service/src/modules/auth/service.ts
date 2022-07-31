import type { Models } from 'utils/types'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { throwErrorIf } from 'utils/errors'
import * as input from './input'
import * as types from './types'

export function AuthService({ UserModel }: Models) {
  function createToken(userId: number) {
    const payload = <types.UserToken>{
      id: userId,
    }

    return {
      accessToken: jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '325d' }),
    }
  }

  async function register({ email, password, username }: input.Register) {
    const tx = await UserModel.getConnect()

    try {
      const usernameInDb = await UserModel.exists({ username }, tx)
      throwErrorIf(usernameInDb, 'Данный username уже используеться!')

      const emailInDb = await UserModel.exists({ email }, tx)
      throwErrorIf(emailInDb, 'Данный E-mail уже используеться!')

      const hash = await argon2.hash(password)
      const user = await UserModel.create({
        hash,
        email,
        username,
      }, tx)

      return {
        ...createToken(user.id),
        user,
      }
    } catch (e) {
      throw e
    } finally {
      tx.release()
    }
  }

  async function login({ email, username, password }: input.Login) {
    const errorMsg = 'Неправильный Username/E-mail/Пароль'

    throwErrorIf(!username && !email, errorMsg)

    const candidate = await UserModel.findOne({
      where: email ? { email } : { username },
      select: ['hash'],
    })
    throwErrorIf(!candidate, errorMsg)

    const isMatch = await argon2.verify(candidate.hash!, password)
    throwErrorIf(!isMatch, errorMsg)

    return createToken(candidate.id)
  }


  return {
    login,
    register,
  }
}
