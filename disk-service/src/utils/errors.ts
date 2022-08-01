import type {
  preHandlerHookHandler,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import { formatErrorMsg, parseAcceptLanguage } from 'i18n'
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

type Validate<T> = preHandlerHookHandler<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, { Body: T }> // eslint-disable-line

export const zoplyValidate = (schema: any): Validate<any> => (req, res, done) => {
  req.lang = parseAcceptLanguage(req.headers['accept-language']!)

  const errors = validateSchema({
    schema,
    values: req.body,
    formater: formatErrorMsg(req.lang),
  })

  if (Object.keys(errors).length != 0) {
    return res.status(400).send({
      errors,
    })
  }

  done()
}
