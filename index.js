import fp from 'fastify-plugin'

import { setupSchema } from './lib'
import Collector from './lib/collector'

export default fp(async app => {
  app.graphql.addHook('preParsing', async (schema, source, context) => {
    context.mercuriusExplainCollector = new Collector()
  })

  app.graphql.addHook('onResolution', async (execution, context) => {
    execution.data.__explain = context.mercuriusExplainCollector.export()
  })

  setupSchema(app.graphql.schema)
})
