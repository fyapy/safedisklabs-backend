import type { SetupRoutes } from 'utils/types'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  router.route({
    url: '/profile',
    method: 'GET',
    handler: req => services.UserService.getUser(req.userId),
  })

  done()
}
