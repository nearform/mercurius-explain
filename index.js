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
      context.explain = {
        enabled
      }
      return
    }

    context.explain = {
      enabled,
      gateway: options.gateway,
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

function extractExplainGateway(context, { profiler, resolverCalls }) {
  if (!context.collectors?.extensions) {
    console.warn('Collectors are empty')
    return
  }

  const extensions = Object.values(context.collectors.extensions)

  if (!extensions.some(extension => extension.data?.explain)) {
    console.warn('Mercurius explain is not enabled on any service')
    return
  }

  for (const extension of extensions) {
    extension.data.explain.profiler.data.forEach(entry => {
      const profile = profiler.find(profile => profile.path === entry.path)
      if (profile) {
        const child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }

        if (!profile.children) {
          profile.children = [child]
          return
        }
        profile.children.push(child)
      }
    })

    extension.data.explain.resolverCalls.data.forEach(entry => {
      const resolverCall = resolverCalls.find(
        resolverCall => resolverCall.key === entry.key
      )
      if (resolverCall) {
        const child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }

        if (!resolverCall.children) {
          resolverCall.children = [child]
          return
        }
        resolverCall.children.push(child)
      }
    })
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
