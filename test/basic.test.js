import { test } from 'tap'
import Fastify from 'fastify'
import mercuriusExplain from '../lib/index.js'
import mercurius from 'mercurius'

test('return explain value', async t => {
  const app = Fastify()
  t.teardown(app.close.bind(app))

  const schema = `
    type Query {
      add(x: Int, y: Int): Int
      hello: String
    }
  `

  const resolvers = {
    Query: {
      async add(_, { x, y }) {
        t.pass('add called only once')
        return x + y
      }
    }
  }

  app.register(mercurius, {
    schema,
    resolvers
  })

  app.register(mercuriusExplain, {})

  const query = '{ add(x: 2, y: 2) }'
  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  t.equal(res.statusCode, 200)
  const { data } = res.json()
  t.has(data, {
    add: 4
  })
  t.type(data['__explain'], Array)
  t.equal(data['__explain'].length, 1)
  t.hasProps(data['__explain'].pop(), ['path', 'begin', 'end', 'time'])
})
