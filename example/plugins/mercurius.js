import mercurius from 'mercurius'
import fp from 'fastify-plugin'
import schemaLoader from '../schema/index.js'

export default fp(
  async (fastify, options) => {
    const { schema, resolvers } = await schemaLoader(fastify, options)
    fastify.register(mercurius, {
      graphql: options.graphql.grapiql,
      schema,
      resolvers
    })

    fastify.get('/sdl', async function () {
      const query = '{ _service { sdl } }'
      return fastify.graphql(query)
    })
  },
  {
    name: 'mercurius',
    dependencies: []
  }
)
