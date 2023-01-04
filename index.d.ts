import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {
  enabled: boolean
}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain

export type ExplainGraphiQLPluginOptions = {
  version?: string
}

export type ExplainGraphiQLPluginReturnType = {
  name: string
  umdUrl: string
  fetcherWrapper: string
}

export declare function explainGraphiQLPlugin(
  options?: ExplainGraphiQLPluginOptions
): ExplainGraphiQLPluginReturnType
