'use strict'

const fp = require('fastify-plugin')

module.exports = fp(
  async (fastify) => {
    fastify.register(require('../../lib/index.cjs'))
  },
  {
    name: 'mercurius-explain',
    dependencies: ['mercurius']
  }
)
