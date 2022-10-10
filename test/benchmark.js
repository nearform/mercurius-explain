import autocannon from 'autocannon'
import mercurius from 'mercurius'
import mercuriusExplain from '../index.js'
import Fastify from 'fastify'

async function benchmark() {
  const enabledInstance = await startAutocannon({ enabled: true })
  const disabledInstance = await startAutocannon({ enabled: false })
  console.log(enabledInstance)
  console.log(disabledInstance)
}

benchmark()

async function startAutocannon({ enabled }) {
  const app = await startServer({ enabled })
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
  const instance = await autocannon({
    url: `http://localhost:3002/graphql?query=${query}`,
    method: 'GET',
    connections: 10,
    pipelining: 1,
    duration: 10
  })
  app.close.bind(app)
  return instance
}

async function startServer({ enabled }) {
  const app = Fastify({ port: 3002 })
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
        return [{ zip: '12345' }, { zip: '54321' }]
      },

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
  app.register(mercurius, {
    schema,
    resolvers
  })

  app.register(mercuriusExplain, { enabled })
  return app
}
