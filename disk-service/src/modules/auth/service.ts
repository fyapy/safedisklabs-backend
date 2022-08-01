import type { Models } from 'utils/types'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { BadRequest } from 'utils/errors'
import { GBToBytes } from 'utils/storage'
import * as input from './input'
import * as types from './types'

export function AuthService({ UserModel, DiskModel }: Models) {
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
      if (usernameInDb) {
        throw new BadRequest('USERNAME_ALREADY_IN_USE')
      }

      const emailInDb = await UserModel.exists({ email }, tx)
      if (emailInDb) {
        throw new BadRequest('EMAIL_ALREADY_IN_USE')
      }

      const hash = await argon2.hash(password)
      const user = await UserModel.create({
        hash,
        email,
        username,
      }, tx)

      await DiskModel.create({
        userId: user.id,
        maxSize: GBToBytes(8),
        usedSize: 0,
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
    if (!username && !email) {
      throw new BadRequest('LOGIN_ERROR')
    }

    const candidate = await UserModel.findOne({
      where: email ? { email } : { username },
      select: ['hash'],
    })
    if (!candidate) {
      throw new BadRequest('LOGIN_ERROR')
    }

    const isMatch = await argon2.verify(candidate.hash!, password)
    if (!isMatch) {
      throw new BadRequest('LOGIN_ERROR')
    }

    return createToken(candidate.id)
  }


  return {
    login,
    register,
  }
}
