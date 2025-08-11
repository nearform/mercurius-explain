import type { FastifyPluginAsync } from 'fastify'
import { expectAssignable, expectType, expectError } from 'tsd'
import explain, {
  explainGraphiQLPlugin
} from '../../index.js'
import type { ExplainGraphiQLPluginReturnType, MercuriusExplainOptions } from '../../index.d.ts'

// MercuriusExplainOptions
const mercuriusExplainOptions = {
  enabled: true,
  gateway: true
}
expectAssignable<MercuriusExplainOptions>(mercuriusExplainOptions)

// default export
expectType<FastifyPluginAsync<MercuriusExplainOptions>>(explain)

// explainGraphiQLPlugin
expectType<ExplainGraphiQLPluginReturnType>(explainGraphiQLPlugin())
expectType<ExplainGraphiQLPluginReturnType>(explainGraphiQLPlugin({}))
expectType<ExplainGraphiQLPluginReturnType>(
  explainGraphiQLPlugin({ version: 'v1' })
)
// Version should only accept strings
expectError(explainGraphiQLPlugin({ version: 2 }))
