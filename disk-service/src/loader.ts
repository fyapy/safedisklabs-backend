import fastify from 'fastify'
import cors from '@fastify/cors'
import multer from 'fastify-multer'
import formbody from '@fastify/formbody'
import fastifyStatic from '@fastify/static'
import * as storage from 'utils/storage'
import { RoutesPlugin } from 'routes'
import { connect } from 'aurora-orm'
import { BadRequest, HttpError } from 'utils/errors'
import { dictionaries, parseAcceptLanguage } from 'i18n'

export default async () => {
  await connect({ debug: false })

  const app = fastify({
    trustProxy: true,
  })

  app.setErrorHandler((error, req, res) => {
    if (typeof req.lang !== 'string') {
      req.lang = parseAcceptLanguage(req.headers['accept-language']!)
    }

    const dictionary = dictionaries[req.lang]
    const message = dictionary[error.message] ?? error.message

    if (error instanceof HttpError) {
      return res.status(error.status).send({
        status: error.status,
        message,
      })
    } else if (error instanceof BadRequest) {
      return res.status(error.status).send({
        status: error.status,
        message,
      })
    }

    res.status(500).send({
      status: 500,
      message,
    })
  })

  app.register(cors, {
    maxAge: 600,
    credentials: true,
    origin: true,
  })
  app.register(multer.contentParser)
  app.addHook('onResponse', storage.afterUpload)
  app.register(formbody, {
    bodyLimit: storage.MBToBytes(20),
  })
  app.register(fastifyStatic, {
    prefix: '/api/img',
    root: storage.rootPath('public/img'),
  })

  // Load API routes
  const routes = RoutesPlugin()
  app.register(routes.plugin, { prefix: '/api' })
  // app.get('/sitemap.xml', sitemapHander(routes.repos))

  return {
    app,
  }
}
