'use strict'

const fp = require('fastify-plugin')

const Collector = require('./collector.cjs')

const wrapper =
  (schemaTypeName, fieldName, resolver) =>
  async (value, args, context, info) => {
    const hrTimeStart = process.hrtime()
    const result = await resolver(value, args, context, info)
    const hrTimeStop = process.hrtime()

    const start = hrTimeStart[0] * 1000000 + hrTimeStart[1] / 1000
    const stop = hrTimeStop[0] * 1000000 + hrTimeStop[1] / 1000
    context.mercuriusExplainCollector.addEntry(info.path, start, stop)
    return result
  }

function setupSchema(schema) {
  const schemaTypeMap = schema.getTypeMap()
  // console.log(schemaTypeMap)

  for (const schemaType of Object.values(schemaTypeMap)) {
    if (schemaType.name.startsWith('__')) {
      continue
    }
    if (typeof schemaType.getFields === 'function') {
      for (const [fieldName, field] of Object.entries(schemaType.getFields())) {
        // console.log('    ', fieldName, field.resolve)
        if (typeof field.resolve === 'function') {
          field.resolve = wrapper(schemaType.name, fieldName, field.resolve)
        }
      }
    }
  }
}

module.exports = fp(
  async (fastify, options) => {
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
    dependencies: ['mercurius'],
  }
)

