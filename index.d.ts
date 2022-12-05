import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {
  enabled: boolean | (()=> boolean)
  gateway?: boolean
}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain
