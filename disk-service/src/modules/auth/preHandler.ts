import type { preHandlerHookHandler } from 'fastify'
import type { Models } from 'utils/types'
import type { UserToken } from './types'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { HttpError } from 'utils/errors'

export const tokenIsGood = (dirtyToken?: string): UserToken => {
  if (!dirtyToken?.includes('Bearer ')) {
    throw new HttpError(401, 'PLEASE_AUTH')
  }

  const token = dirtyToken.replace('Bearer ', '')

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserToken

  if (!payload) {
    throw new HttpError(401, 'PLEASE_AUTH')
  }
  if (Date.now() >= payload.exp! * 1000) {
    throw new HttpError(401, 'PLEASE_AUTH')
  }

  return payload
}

export const authPreHandler = ({ UserModel }: Models) => (
  ignoreBanned = false,
): preHandlerHookHandler => async req => {
  try {
    const { id } = tokenIsGood(req.headers.authorization)

    req.userId = id

    if (!ignoreBanned) {
      const user = await UserModel.findOne({
        where: id,
        select: ['blockedAt'],
      })

      if (user?.blockedAt) {
        throw new HttpError(403, 'FORBIDDEN')
      }
    }
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      throw new HttpError(401, 'INVALID_TOKEN')
    }

    throw e
  }
}
