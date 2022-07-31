import { SetupRoutes } from 'utils/types'
import { zoplyValidate } from 'utils/errors'
import * as input from './input'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  router.route<{ Body: input.Login }>({
    url: '/login',
    method: 'POST',
    preHandler: zoplyValidate(input.loginSchema),
    handler: req => services.AuthService.login(req.body),
  })

  router.route<{ Body: input.Register }>({
    url: '/register',
    method: 'POST',
    preHandler: zoplyValidate(input.registerSchema),
    handler: req => services.AuthService.register(req.body),
  })

  done()
}
