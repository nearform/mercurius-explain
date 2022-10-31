import { readFileSync } from 'fs'
import fp from 'fastify-plugin'
import semver from 'semver'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS } from './lib/constant.js'

const fileUrl = new URL('./package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

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

export function explainGraphiQLPlugin(version) {
  const packageVersion = version || `^${semver.major(packageJSON.version)}`
  return {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@${packageVersion}/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  }
}
