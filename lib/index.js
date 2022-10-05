import fp from 'fastify-plugin'
import { Collector } from './collector.js'

function resolvePath({ prev, key }) {
  return prev ? `${resolvePath(prev)}.${key}` : key
}

const wrapper =
  (schemaTypeName, fieldName, resolver) =>
  async (value, args, context, info) => {
    const { path } = info

    const begin = Number(process.hrtime.bigint())
    const result = await resolver(value, args, context, info)
    const end = Number(process.hrtime.bigint())

    context.mercuriusExplainCollector.addEntry({
      path: resolvePath(path),
      begin,
      end,
      time: end - begin
    })
    return result
  }

function setupSchema(schema) {
  for (const schemaType of Object.values(schema.getTypeMap())) {
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
