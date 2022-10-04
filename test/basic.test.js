import { test } from 'tap'
import Fastify from 'fastify'
import mercuriusExplain from '../lib/index.js'
import mercurius from './shared/mercurius.js'

test('', async t => {
  const fastify = Fastify()
  await fastify.register(mercurius)
  await fastify.register(mercuriusExplain)
  t.teardown(() => fastify.close())
  await fastify.listen()
})
