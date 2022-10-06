import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'

export default config =>
  fp(async function (fastify, options) {
    fastify.decorate('config', config)

    for (const plugin of config.thirdParty || []) {
      fastify.register(plugin.module, Object.assign({}, options, config))
    }

    for (const plugin of config.autoload) {
      fastify.register(autoload, {
        dir: plugin.path,
        options: Object.assign({}, options, config)
      })
    }

    fastify.get('/alive', () => {
      return { status: 'OK' }
    })

    fastify.get('/', () => {
      return { status: 'OK' }
    })
  })
