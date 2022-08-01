import type { SetupRoutes } from 'utils/types'
import { authPreHandler } from 'modules/auth'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  const auth = authPreHandler(services.Models)

  router.route({
    url: '/profile',
    method: 'GET',
    preHandler: auth(),
    handler: req => services.UserService.getUser(req.userId),
  })

  done()
}
