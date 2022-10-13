import Fastify from 'fastify'
import mercurius from 'mercurius'
import { test } from 'tap'
import mercuriusExplain from '../index.js'
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

  app.register(mercuriusExplain, { enabled: true })

  const query = '{ add(x: 2, y: 2) }'
  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  t.equal(res.statusCode, 200)
  const { data, extensions } = res.json()
  t.has(data, {
    add: 4
  })
  t.type(extensions.explain.profiler.data, Array)
  t.ok(extensions.explain.profiler.data.length, 1)

  const explain = extensions.explain.profiler.data.pop()

  t.hasProps(explain, ['path', 'begin', 'end', 'time'])
  t.ok(explain.begin > 0)
  t.ok(explain.end > 0)
  t.ok(explain.time > 0)
})

test('should handle multiple resolvers', async t => {
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

  app.register(mercuriusExplain, { enabled: true })

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
  const { extensions } = res.json()
  t.type(extensions.explain.profiler.data, Array)
  t.ok(extensions.explain.profiler.data.length, 5)
  t.ok(
    extensions.explain.profiler.data.every(({ path }) =>
      path.startsWith('user')
    )
  )
  t.ok(extensions.explain.profiler.data.every(({ begin }) => begin > 0))
  t.ok(extensions.explain.profiler.data.every(({ end }) => end > 0))
  t.ok(extensions.explain.profiler.data.every(({ time }) => time > 0))
})

test('plugin disabled', async t => {
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

  app.register(mercuriusExplain, { enabled: false })

  const query = '{ add(x: 2, y: 2) }'
  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })
  const { extensions } = res.json()
  t.equal(res.statusCode, 200)
  t.notHas(extensions, 'explain')
})
