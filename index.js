import fp from 'fastify-plugin'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS } from './lib/constant.js'

export default fp(async (fastify, deafultOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...deafultOptions }
  if (!options.enabled) return
  const isEnabled =
    typeof options.enabled === 'function' ? options.enabled : () => true
  fastify.graphql.addHook('preParsing', async (request, reply, context) => {
    if (!isEnabled({ request, reply, context })) return
    context.mercuriusExplainCollector = new Collector()
  })

  fastify.graphql.addHook('onResolution', async (execution, context) => {
    if (!isEnabled({ execution, context })) return
    execution.extensions = {
      ...execution.extensions,
      explain: context.mercuriusExplainCollector.export()
    }
  })

  wrapResolvers(fastify.graphql.schema)
})
