import fp from 'fastify-plugin'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'

export default fp(async (fastify, options) => {
  if (!options.enabled) return

  fastify.graphql.addHook('preParsing', async (_, __, context) => {
    context.mercuriusExplainCollector = new Collector()
  })

  fastify.graphql.addHook('onResolution', async (execution, context) => {
    execution.extensions = {
      ...execution.extensions,
      explain: {
        profiler: {
          data: context.mercuriusExplainCollector.export()
        }
      }
    }
  })

  wrapResolvers(fastify.graphql.schema)
})
