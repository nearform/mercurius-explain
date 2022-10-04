'use strict'

const mercurius = require('mercurius')
const fp = require('fastify-plugin')

const schemaLoader = require('../schema/index.cjs')

module.exports = fp(
  async (fastify, options) => {
    const { schema, resolvers } = await schemaLoader(fastify, options)
    fastify.register(mercurius, {
      graphiql: options.graphql.graphiql,
      schema,
      resolvers,
    })

    fastify.get('/sdl', async function () {
      const query = '{ _service { sdl } }'
      return fastify.graphql(query)
    })
  },
  {
    name: 'mercurius',
    dependencies: [],
  }
)
