import mercurius from 'mercurius'
import mercuriusExplain from 'mercurius-plugin'
import Fastify from 'fastify'
import { promisify } from 'util'
const setTimeoutAsync = promisify(setTimeout)

export default async function startServer({ enabled, timeout = 0 }) {
  const app = Fastify()
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
        await setTimeoutAsync(timeout)
        return [{ zip: '12345' }, { zip: '54321' }]
      },

      status: async () => {
        await setTimeoutAsync(timeout)
        return { enabled: true }
      }
    },
    Query: {
      users: async () => {
        await setTimeoutAsync(timeout)
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

  app.register(mercuriusExplain, { enabled })
  await app.listen({ port: 3002 })
  return app
}
