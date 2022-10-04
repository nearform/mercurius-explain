'use strict'

const fp = require('fastify-plugin')

const { setupSchema } = require('./lib')
const Collector = require('./lib/collector')

module.exports = fp(async app => {
  app.graphql.addHook('preParsing', async (schema, source, context) => {
    context.mercuriusExplainCollector = new Collector()
  })

  app.graphql.addHook('onResolution', async (execution, context) => {
    execution.data.__explain = context.mercuriusExplainCollector.export()
  })

  setupSchema(app.graphql.schema)
})
