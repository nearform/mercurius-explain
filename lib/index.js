import fp from 'fastify-plugin'
import { Collector } from './collector.js'

function resolvePath({ prev, key }) {
  return prev ? `${resolvePath(prev)}.${key}` : key
}

const wrapper = (_, __, resolver) => async (value, args, context, info) => {
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
    if (!options.enabled) {
      return
    }
    fastify.graphql.addHook('preParsing', async (_, __, context) => {
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
