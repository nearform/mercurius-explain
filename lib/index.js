import fp from 'fastify-plugin'
import { Collector } from './collector.js'

function hrtimeToMs(hrTime) {
  return hrTime[0] * 1000000 + hrTime[1] / 1000
}

function resolvePath(structuredPath) {
  return structuredPath.prev
    ? `${resolvePath(structuredPath.prev)}.${structuredPath.key}`
    : structuredPath.key
}

function formatTimeMs({ begin, end }) {
  return (end - begin) / 1000
}

const wrapper =
  (schemaTypeName, fieldName, resolver) =>
  async (value, args, context, info) => {
    const { path } = info

    const begin = hrtimeToMs(process.hrtime())
    const result = await resolver(value, args, context, info)
    const end = hrtimeToMs(process.hrtime())

    context.mercuriusExplainCollector.addEntry({
      path: resolvePath(path),
      begin,
      end,
      time: formatTimeMs({ begin, end })
    })
    return result
  }

function setupSchema(schema) {
  const schemaTypeMap = schema.getTypeMap()
  for (const schemaType of Object.values(schemaTypeMap)) {
    if (schemaType.name.startsWith('__')) {
      continue
    }
    if (typeof schemaType.getFields === 'function') {
      for (const [fieldName, field] of Object.entries(schemaType.getFields())) {
        if (typeof field.resolve === 'function') {
          field.resolve = wrapper(schemaType.name, fieldName, field.resolve)
        }
      }
    }
  }
}

export default fp(
  async (fastify, options) => {
    console.log(options)
    fastify.graphql.addHook('preParsing', async (schema, source, context) => {
      context.mercuriusExplainCollector = new Collector()
    })

    fastify.graphql.addHook('onResolution', async (execution, context) => {
      execution.data.__explain = context.mercuriusExplainCollector.export()
    })

    setupSchema(fastify.graphql.schema)
  },
  {
    name: 'mercurius-explain',
    dependencies: ['mercurius']
  }
)
