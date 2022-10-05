import Fastify from 'fastify'
import mercurius from 'mercurius'
import { test } from 'tap'
import mercuriusExplain from '../lib/index.js'
import { promisify } from 'util'

const asyncTimeout = promisify(setTimeout)

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
  t.ok(data['__explain'].length, 1)

  const explain = data['__explain'].pop()

  t.hasProps(explain, ['path', 'begin', 'end', 'time'])
  t.ok(explain.begin > 0)
  t.ok(explain.end > 0)
  t.ok(explain.time > 0)
})

test('', async t => {
  const app = Fastify()
  t.teardown(app.close.bind(app))

  const schema = `
        #graphql
        type User {
          name: String
          addresses: [Address]
          status: UserStatus
        }
  
        type UserStatus {
          enabled: Boolean
        }
        
        type Address {
          zip: String
        }
  
        type Query {
          users: [User]
        }
      `
  const resolvers = {
    User: {
      addresses: async () => {
        await asyncTimeout(120)
        return [{ zip: '12345' }, { zip: '54321' }]
      },

      status: async () => {
        await asyncTimeout(200)
        return { enabled: true }
      }
    },
    Query: {
      users: async () => {
        await asyncTimeout(300)
        return [
          {
            id: 'abc',
            name: 'Davide'
          },
          {
            id: 'cde',
            name: 'Mario'
          }
        ]
      }
    }
  }
  app.register(mercurius, {
    schema,
    resolvers
  })

  app.register(mercuriusExplain, {})

  const query = `{
    users {
      name
      status {
        enabled
      }
      addresses {
        zip
      }
    }
}`

  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  t.equal(res.statusCode, 200)
  const { data } = res.json()
  t.type(data['__explain'], Array)
  t.ok(data['__explain'].length, 5)
  t.ok(data['__explain'].every(({ path }) => path.startsWith('user')))
  t.ok(data['__explain'].every(({ begin }) => begin > 0))
  t.ok(data['__explain'].every(({ end }) => end > 0))
  t.ok(data['__explain'].every(({ time }) => time > 0))
})
