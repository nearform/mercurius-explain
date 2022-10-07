import { join } from 'desm'
export default {
  app: {
    port: 3001
  },
  log: { pretty: true },
  autoload: [{ path: join(import.meta.url, './plugins') }],
  graphql: { graphiql: true }
}
