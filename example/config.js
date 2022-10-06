import { join } from 'desm'
export default {
  app: {
    port: 3000
  },
  log: { pretty: true },
  autoload: [{ path: join(import.meta.url, './plugins') }],
  graphql: { graphiql: true }
}
