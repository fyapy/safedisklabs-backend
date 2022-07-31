import type {
  preHandlerHookHandler,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import { validateSchema } from 'zoply-schema'

export class HttpError extends Error {
  status: number

  constructor(status: number, message = '') {
    super()

    this.status = status
    this.message = message
  }
}
export class BadRequest extends HttpError {
  constructor(message: string) {
    super(400, message)
  }
}
export class NotFound extends HttpError {
  constructor(message: string) {
    super(404, message)
  }
}

export function throwErrorIf(val: boolean, text: string) {
  if (val === true) {
    throw new BadRequest(text)
  }
}

type Validate<T> = preHandlerHookHandler<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, { Body: T }> // eslint-disable-line

export const zoplyValidate = (schema: any): Validate<any> => ({ body }, res, done) => {
  const errors = validateSchema({
    schema,
    values: body,
  })

  if (Object.keys(errors).length != 0) {
    return res.status(400).send({
      errors,
    })
  }

  done()
}
