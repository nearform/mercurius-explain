import { readFileSync } from 'fs'
import fp from 'fastify-plugin'
import semver from 'semver'
import { Collector } from './lib/collector.js'
import wrapResolvers from './lib/wrapResolvers.js'
import { DEFAULT_OPTIONS, FEDERATION_HEADER } from './lib/constant.js'
import { extractExplainGateway } from './lib/gateway.js'

const fileUrl = new URL('./package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

export default fp(async (fastify, opts) => {
  const options = { ...DEFAULT_OPTIONS, ...opts }
  fastify.graphql.addHook('preParsing', async (schema, source, context) => {
    const enabled = await isEnabled(options, {
      schema,
      source,
      context
    })

    if (!enabled) {
      context.explain = {
        enabled
      }
      return
    }

    context.explain = {
      enabled,
      gateway: options.gateway,
      federated: options.federated,
      collector: new Collector()
    }
  })

  fastify.graphql.addHook('onResolution', async (execution, context) => {
    if (!context.explain.enabled) return
    execution.extensions = formatExtensions(execution, context)
  })
  wrapResolvers(fastify.graphql.schema)
})

function formatExtensions(execution, context) {
  const profiler = context.explain.collector.exportEntries()
  const resolverCalls = context.explain.collector.exportResolversCalls()

  if (context.explain.gateway) {
    extractExplainGateway(context, { profiler, resolverCalls })
  }

  return {
    ...execution.extensions,
    explain: {
      gateway: context.explain.gateway,
      version: packageJSON.version,
      profiler: {
        data: profiler
      },
      resolverCalls: {
        data: resolverCalls
      }
    }
  }
}

async function isEnabled(options, { schema, source, context }) {
  if (options.federated && context.reply.request.headers[FEDERATION_HEADER]) {
    return true
  }

  try {
    return typeof options.enabled === 'function'
      ? await options.enabled({ schema, source, context })
      : options.enabled
  } catch (error) {
    return false
  }
}

export function getExplainFederatedHeader(context) {
  if (context?.explain?.enabled) {
    return FEDERATION_HEADER
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
