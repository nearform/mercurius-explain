import { FastifyPluginAsync } from 'fastify'

export interface MercuriusExplainOptions {}

declare const mercuriusExplain: FastifyPluginAsync<MercuriusExplainOptions>

export default mercuriusExplain
