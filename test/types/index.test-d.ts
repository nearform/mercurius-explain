import { expectAssignable, expectType, expectError } from 'tsd'
import { MercuriusExplainOptions, explainGraphiQLPlugin } from '../../index'
const mercuriusExplainOptions = {
  enabled: true
}
expectAssignable<MercuriusExplainOptions>(mercuriusExplainOptions)

// explainGraphiQLPlugin
type ExplainGraphiQLPluginReturnType = {
  name: string,
  umdUrl: string,
  fetcherWrapper: string,
};

expectType<ExplainGraphiQLPluginReturnType>(explainGraphiQLPlugin())
expectType<ExplainGraphiQLPluginReturnType>(explainGraphiQLPlugin({}))
expectType<ExplainGraphiQLPluginReturnType>(explainGraphiQLPlugin({version: 'v1'}))
// Version should only accept strings
expectError(explainGraphiQLPlugin({version: 2}))
