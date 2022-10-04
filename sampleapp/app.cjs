'use strict'

const autoload = require('@fastify/autoload')
const fp = require('fastify-plugin')

module.exports = (config) =>
  fp(async function (fastify, options) {
    fastify.decorate('config', config)

    for (const plugin of config.thirdParty || []) {
      fastify.register(plugin.module, Object.assign({}, options, config))
    }

    for (const plugin of config.autoload) {
      fastify.register(autoload, {
        dir: plugin.path,
        options: Object.assign({}, options, config),
      })
    }

    fastify.get('/alive', () => {
      return { status: 'OK' }
    })

    fastify.get('/', () => {
      return { status: 'OK' }
    })
  })
