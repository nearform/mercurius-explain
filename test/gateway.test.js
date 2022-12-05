'use strict'
import { buildFederationSchema } from '@mercuriusjs/federation'
import mercuriusGateway from '@mercuriusjs/gateway'
import Fastify from 'fastify'
import mercurius from 'mercurius'
import { test } from 'tap'
import mercuriusExplain from '../index.js'
import { posts, users } from './utils/mocks.js'

async function createTestService(t, schema, resolvers) {
  const service = Fastify()

  service.register(mercurius, {
    schema: buildFederationSchema(schema),
    resolvers
  })

  service.register(mercuriusExplain, {
    enabled: true
  })

  await service.ready()

  await service.listen({ port: 0 })
  return [service, service.server.address().port]
}

const query = `
    query {
      me {
        id
        name
        topPosts(count: 2) {
          pid
          author {
            id
          }
        }
      }
      topPosts(count: 2) {
        pid
      }
    }
  `

async function createTestGatewayServer(t, opts = {}) {
  // User service
  const userServiceSchema = `
    type Query @extends {
      me: User
    }
  
    type User @key(fields: "id") {
      id: ID!
      name: String!
    }`
  const userServiceResolvers = {
    Query: {
      me: () => {
        return users.u1
      }
    },
    User: {
      __resolveReference: user => {
        return users[user.id]
      }
    }
  }
  const [userService, userServicePort] = await createTestService(
    t,
    userServiceSchema,
    userServiceResolvers
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
    postServiceResolvers
  )

  const gateway = Fastify()

  t.teardown(async () => {
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
            collectExtensions: true
          }
        },
        {
          name: 'post',
          url: `http://localhost:${postServicePort}/graphql`,
          collectors: {
            collectExtensions: true
          }
        }
      ]
    },
    ...opts
  })

  gateway.register(mercuriusExplain, { enabled: true, gateway: true })

  return gateway
}

test('gateway - hooks', async t => {
  const app = await createTestGatewayServer(t)

  const res = await app.inject({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: '/graphql',
    body: JSON.stringify({ query })
  })

  const { extensions } = res.json()
  t.hasProp(extensions, 'explain')
  const { profiler, resolverCalls } = extensions.explain

  t.has(profiler.data, [
    {
      path: 'me'
    },
    {
      path: 'topPosts'
    }
  ])

  t.same(resolverCalls.data, [
    { key: 'Query.me', count: 1 },
    { key: 'Query.topPosts', count: 1 }
  ])
})
