import type { JustId, SetupRoutes } from 'utils/types'

export const setupRoutes: SetupRoutes = (router, { services }, done) => {
  router.route<{ Params: JustId }>({
    url: '/:id',
    method: 'GET',
    handler: req => services.FileService.view(req.params.id),
  })

  done()
}
