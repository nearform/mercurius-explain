import { promisify } from 'util'

import Fastify from 'fastify'
import mercurius from 'mercurius'
import { test } from 'tap'

import mercuriusExplain from '../index.js'

const asyncTimeout = promisify(setTimeout)

const schema = `
  #graphql
  type User {
    name: String
    contacts: [Contact]
    status: UserStatus
  }

  type UserStatus {
    enabled: Boolean
  }

  type Contact {
    emails: [Email]
  }

  type Email {
    address: String
  }

  type Query {
    users: [User]
  }
`

const resolvers = {
  User: {
    contacts: async () => {
      await asyncTimeout(120)
      return [{ id: '12345' }]
    },

    status: async () => {
      await asyncTimeout(200)
      return { enabled: true }
    }
  },
  Contact: {
    emails: async () => {
      return [{ address: 'test@email.com' }, { address: 'test@email.com' }]
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

const query = `{
    users {
      name
      status {
        enabled
      }
      contacts {
        emails {
          address
        }
      }
    }
  }`

test('should return correct call count', async t => {
  const app = Fastify()

  t.teardown(app.close.bind(app))

  app.register(mercurius, {
    schema,
    resolvers
  })

  app.register(mercuriusExplain, { enabled: true })

  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  const {
    extensions: {
      explain: { resolverCalls }
    }
  } = res.json()

  t.same(resolverCalls, {
    data: [
      { key: 'Query.users', count: 1 },
      { key: 'User.status', count: 2 },
      { key: 'User.contacts', count: 2 },
      { key: 'Contact.emails', count: 2 }
    ]
  })
})

test('should return correct call count when resolver fails', async t => {
  const app = Fastify()

  t.teardown(app.close.bind(app))

  app.register(mercurius, {
    schema,
    resolvers: {
      ...resolvers,
      User: {
        ...resolvers.User,
        status: async () => {
          throw new Error()
        }
      }
    }
  })

  app.register(mercuriusExplain, { enabled: true })

  const res = await app.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query
    }
  })

  const {
    extensions: {
      explain: { resolverCalls }
    }
  } = res.json()

  t.same(resolverCalls, {
    data: [
      { key: 'Query.users', count: 1 },
      { key: 'User.status', count: 2 },
      { key: 'User.contacts', count: 2 },
      { key: 'Contact.emails', count: 2 }
    ]
  })
})
