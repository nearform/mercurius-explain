import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {
  enabled: boolean | (() => boolean)
  gateway?: boolean
  federated?: boolean
}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain
