import fp from 'fastify-plugin'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS } from './lib/constant.js'

export default fp(async (fastify, deafultOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...deafultOptions }

  fastify.graphql.addHook('preParsing', async (schema, source, context) => {
    context.mercuriusExplainEnabled = isEnabled(options, {
      schema,
      source,
      context
    })
    if (!context.mercuriusExplainEnabled) return
    context.mercuriusExplainCollector = new Collector()
  })

  fastify.graphql.addHook('onResolution', async (execution, context) => {
    if (!context.mercuriusExplainEnabled) return
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

function isEnabled(options, { schema, source, context }) {
  try {
    if (!options.enabled) return false
    return typeof options.enabled === 'function'
      ? options.enabled({ schema, source, context })
      : true
  } catch (error) {
    return false
  }
}
