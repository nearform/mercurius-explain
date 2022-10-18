import fp from 'fastify-plugin'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS } from './lib/constant.js'

export default fp(async (fastify, deafultOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...deafultOptions }

  fastify.graphql.addHook('preParsing', async (schema, source, context) => {
    context.mercuriusExplainEnabled = await isEnabled(options, {
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
          data: context.mercuriusExplainCollector.exportEntries()
        },
        resolverCalls: {
          data: context.mercuriusExplainCollector.exportResolversCalls()
        }
      }
    }
  })

  wrapResolvers(fastify.graphql.schema)
})

async function isEnabled(options, { schema, source, context }) {
  try {
    return typeof options.enabled === 'function'
      ? await options.enabled({ schema, source, context })
      : options.enabled
  } catch (error) {
    return false
  }
}

export function explainGraphiQLPlugin() {
  return {
    name: 'mercuriusExplain',
    umdUrl:
      'https://unpkg.com/mercurius-explain-graphiql-plugin/dist/umd/index.js',
    fetcherWrapper: 'parseFetchResponse'
  }
}
