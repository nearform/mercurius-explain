import type { FastifyPluginAsync } from 'fastify'
import { expectAssignable, expectType, expectError } from 'tsd'
import explain, {
  MercuriusExplainOptions,
  explainGraphiQLPlugin,
  ExplainGraphiQLPluginReturnType
} from '../../index'

// MercuriusExplainOptions
const mercuriusExplainOptions = {
  enabled: true
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
