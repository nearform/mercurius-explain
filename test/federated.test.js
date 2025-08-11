'use strict'
import { buildFederationSchema } from '@mercuriusjs/federation'
import mercuriusGateway from '@mercuriusjs/gateway'
import Fastify from 'fastify'
import mercurius from 'mercurius'
import { test } from 'node:test'
import mercuriusExplain, { getExplainFederatedHeader } from '../index.js'
import { posts } from './utils/mocks.js'

async function createTestService(t, schema, resolvers, federationEnabled) {
  const service = Fastify()

  service.register(mercurius, {
    schema: buildFederationSchema(schema),
    resolvers
  })
  service.register(mercuriusExplain, {
    enabled: false,
    federated: federationEnabled
  })

  await service.ready()

  service.graphql.addHook('onResolution', async execution => {
    execution.extensions = { ...execution.extensions, testExtension: {} }
  })

  await service.listen({ port: 0 })
  return [service, service.server.address().port]
}

const query = `
    query {
      users {
        name
        status {
          enabled
        }
      }
      topPosts(count: 2) {
        pid
      }
    }
  `

async function createTestGatewayServer(
  t,
  { federationEnabled, collectorsEnabled, enableWriteHeader }
) {
  // User service
  const userServiceSchema = `
    #graphql
    type User {
      name: String
      status: UserStatus
    }

    type UserStatus {
      enabled: Boolean
    }

    type Query {
      users: [User]
    }
  `
  const userServiceResolvers = {
    User: {
      status: async () => {
        return { enabled: true }
      }
    },
    Query: {
      users: async () => {
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
  const [userService, userServicePort] = await createTestService(
    t,
    userServiceSchema,
    userServiceResolvers,
    federationEnabled
  )

  // Post service
  const postServiceSchema = `
    type Post @key(fields: "pid") {
      pid: ID!
      author: User
    }

    extend type Query {
      topPosts(count: Int): [Post]
    }

    type User @key(fields: "id") @extends {
      id: ID! @external
      topPosts(count: Int!): [Post]
    }`
  const postServiceResolvers = {
    Post: {
      __resolveReference: post => {
        return posts[post.pid]
      },
      author: post => {
        return {
          __typename: 'User',
          id: post.authorId
        }
      }
    },
    User: {
      topPosts: (user, { count }) => {
        return Object.values(posts)
          .filter(p => p.authorId === user.id)
          .slice(0, count)
      }
    },
    Query: {
      topPosts: (root, { count = 2 }) => Object.values(posts).slice(0, count)
    }
  }
  const [postService, postServicePort] = await createTestService(
    t,
    postServiceSchema,
    postServiceResolvers,
    federationEnabled
  )

  const gateway = Fastify()

  t.after(async () => {
    await gateway.close()
    await userService.close()
    await postService.close()
  })

  await gateway.register(mercuriusGateway, {
    gateway: {
      services: [
        {
          name: 'user',
          url: `http://localhost:${userServicePort}/graphql`,
          collectors: {
            collectExtensions: collectorsEnabled
          },
          rewriteHeaders: (headers, context) => {
            if (enableWriteHeader) {
              return { ...getExplainFederatedHeader(context) }
            }
          }
        },
        {
          name: 'post',
          url: `http://localhost:${postServicePort}/graphql`,
          collectors: {
            collectExtensions: collectorsEnabled
          },
          rewriteHeaders: (headers, context) => {
            if (enableWriteHeader) {
              return { ...getExplainFederatedHeader(context) }
            }
          }
        }
      ]
    }
  })
  gateway.register(mercuriusExplain, { enabled: true, gateway: true })

  return gateway
}

test('federated on', async t => {
  const app = await createTestGatewayServer(t, {
    federationEnabled: true,
    collectorsEnabled: true,
    enableWriteHeader: true
  })

  const res = await app.inject({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: '/graphql',
    body: JSON.stringify({ query })
  })

  const { extensions } = res.json()
  t.assert.ok(extensions.explain)
  t.assert.ok(extensions.explain.gateway)
  const { profiler, resolverCalls } = extensions.explain
  t.assert.ok(profiler.data.some(entry => entry.child))

  t.assert.ok(resolverCalls.data.some(entry => entry.child))
})

test('federated off', async t => {
  const app = await createTestGatewayServer(t, {
    federationEnabled: false,
    collectorsEnabled: true,
    enableWriteHeader: true
  })

  const res = await app.inject({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: '/graphql',
    body: JSON.stringify({ query })
  })

  const { extensions } = res.json()
  t.assert.ok(extensions.explain)
  t.assert.ok(extensions.explain.gateway)
  const { profiler, resolverCalls } = extensions.explain
  t.assert.ok(!profiler.data.some(entry => entry.child))

  t.assert.ok(!resolverCalls.data.some(entry => entry.child))
})

test('write headers disabled', async t => {
  const app = await createTestGatewayServer(t, {
    federationEnabled: false,
    collectorsEnabled: true,
    enableWriteHeader: false
  })

  const res = await app.inject({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: '/graphql',
    body: JSON.stringify({ query })
  })

  const { extensions } = res.json()
  t.assert.ok(extensions.explain)
  t.assert.ok(extensions.explain.gateway)
  const { profiler, resolverCalls } = extensions.explain
  t.assert.ok(!profiler.data.some(entry => entry.child))

  t.assert.ok(!resolverCalls.data.some(entry => entry.child))
})
