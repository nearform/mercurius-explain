import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {
  enabled: boolean
}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain
