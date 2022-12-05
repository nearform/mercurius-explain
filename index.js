import { readFileSync } from 'fs'
import fp from 'fastify-plugin'
import semver from 'semver'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS } from './lib/constant.js'

const fileUrl = new URL('./package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

export default fp(async (fastify, defaultOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...defaultOptions }

  fastify.graphql.addHook('preParsing', async (schema, source, context) => {
    const enabled = await isEnabled(options, {
      schema,
      source,
      context
    })

    if (!enabled) {
      context.mercuriusExplain = {
        enabled
      }
      return
    }

    context.mercuriusExplain = {
      enabled,
      gateway: options.gateway,
      collector: new Collector()
    }
  })

  fastify.graphql.addHook('onResolution', async (execution, context) => {
    if (!context.mercuriusExplain.enabled) return
    execution.extensions = context.mercuriusExplain.gateway
      ? formatGatewayExtensions(execution, context)
      : formatExtensions(execution, context)
  })
  wrapResolvers(fastify.graphql.schema)
})

function formatExtensions(execution, context) {
  return {
    ...execution.extensions,
    explain: {
      version: packageJSON.version,
      profiler: {
        data: context.mercuriusExplain.collector.exportEntries()
      },
      resolverCalls: {
        data: context.mercuriusExplain.collector.exportResolversCalls()
      }
    }
  }
}

function formatGatewayExtensions(execution, context) {
  return {
    ...execution.extensions,
    explain: {
      version: packageJSON.version,
      profiler: {
        data: Object.values(context.collectors.extensions).flatMap(
          extension => extension.data.explain.profiler.data
        )
      },
      resolverCalls: {
        data: Object.values(context.collectors.extensions).flatMap(
          extension => extension.data.explain.resolverCalls.data
        )
      }
    }
  }
}

async function isEnabled(options, { schema, source, context }) {
  try {
    return typeof options.enabled === 'function'
      ? await options.enabled({ schema, source, context })
      : options.enabled
  } catch (error) {
    return false
  }
}

export function explainGraphiQLPlugin({ version } = {}) {
  const packageVersion = version || `^${semver.major(packageJSON.version)}`
  return {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@${packageVersion}/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  }
}
