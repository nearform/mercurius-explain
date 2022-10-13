import { promisify } from 'util'

const asyncTimeout = promisify(setTimeout)

export default async () => {
  return {
    schema: `
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
        add(x: Int, y: Int): Int
        users: [User]
      }

      type Mutation {
        sum(x: Int, y: Int): Int
      }
    `,
    resolvers: {
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
        add: async (_, { x, y }) => {
          return x + y
        },
        users: async () => {
          await asyncTimeout(20)
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
  }
}
