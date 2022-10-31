import { promisify } from 'util'
import { readFileSync } from 'fs'
import { test } from 'tap'

import Fastify from 'fastify'
import mercurius from 'mercurius'

import mercuriusExplain from '../index.js'

const fileUrl = new URL('../package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

const asyncTimeout = promisify(setTimeout)

test('return explain version', async t => {
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

  const { extensions } = res.json()
  t.equal(res.statusCode, 200)
  t.hasProp(extensions, 'explain')
  const { version } = extensions.explain
  t.equal(version, packageJSON.version)
})

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

  const { data, extensions } = res.json()
  t.equal(res.statusCode, 200)
  t.has(data, {
    add: 4
  })
  t.hasProp(extensions, 'explain')
  const { profiler } = extensions.explain
  t.type(profiler.data, Array)
  t.ok(profiler.data.length, 1)

  const explain = profiler.data.pop()

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
  const { profiler } = extensions.explain
  t.type(profiler.data, Array)
  t.ok(profiler.data.length, 5)
  t.ok(profiler.data.every(({ path }) => path.startsWith('user')))
  t.ok(profiler.data.every(({ begin }) => begin > 0))
  t.ok(profiler.data.every(({ end }) => end > 0))
  t.ok(profiler.data.every(({ time }) => time > 0))
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
  t.notOk(extensions)
})

test('should handle resolver error', async t => {
  const app = Fastify()
  t.teardown(app.close.bind(app))

  const schema = `
    type Query {
      add(x: Int, y: Int): Int
      hello: String
    }
  `
  const errorMessage = 'custom error'
  const resolvers = {
    Query: {
      async add() {
        throw new Error(errorMessage)
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
  const { extensions } = res.json()
  t.ok(extensions)
  const {
    explain: {
      profiler: { data }
    }
  } = extensions
  t.ok(data)
  const errorObject = data.pop()
  t.hasProp(errorObject, 'error')
  t.equal(errorObject.error, errorMessage)
})

test('plugin disabled by function ', async t => {
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

  app.register(mercuriusExplain, {
    enabled: ({ context }) =>
      Promise.resolve(() => context?.reply?.request?.headers['explain'])
  })

  const query = '{ add(x: 2, y: 2) }'
  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      explain: true
    },
    body: {
      query
    }
  })
  const { extensions } = res.json()
  t.equal(res.statusCode, 200)
  t.hasProp(extensions, 'explain')
})

test('enabled function throws error', async t => {
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

  app.register(mercuriusExplain, {
    enabled: () => {
      throw new Error('enabled error')
    }
  })

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
  t.notOk(extensions)
})

test('enabled function promise reject', async t => {
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

  app.register(mercuriusExplain, {
    enabled: () => {
      return Promise.reject('error')
    }
  })

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
  t.notOk(extensions)
})
