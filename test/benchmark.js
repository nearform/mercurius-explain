import autocannon from 'autocannon'
import mercurius from 'mercurius'
import mercuriusExplain from '../index.js'
import Fastify from 'fastify'
import { promisify } from 'util'

const setTimeoutAsync = promisify(setTimeout)

async function benchmark() {
  const enabledInstance = await startAutocannon({ enabled: true })
  const disabledInstance = await startAutocannon({ enabled: false })
  console.log(autocannon.printResult(disabledInstance))
  console.log(autocannon.printResult(enabledInstance))
}

benchmark()

async function startAutocannon({ enabled }) {
  const app = await startServer({ enabled })
  const instance = await autocannon({
    url: `http://127.0.01:3002/graphql`,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: `{
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
    }),
    connections: 10,
    duration: 10
  })
  await app.close()
  return instance
}

async function startServer({ enabled }) {
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
        await setTimeoutAsync(50)
        return [{ zip: '12345' }, { zip: '54321' }]
      },

      status: async () => {
        await setTimeoutAsync(50)
        return { enabled: true }
      }
    },
    Query: {
      users: async () => {
        await setTimeoutAsync(50)
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
