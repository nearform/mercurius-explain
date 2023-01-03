import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {
  enabled: boolean
}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain

export declare function explainGraphiQLPlugin(options?: { version?: string }): {
  name: string,
  umdUrl: string,
  fetcherWrapper: string,
};
