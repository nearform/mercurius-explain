import { join } from 'desm'
import { explainGraphiQLPlugin } from '../index.js'
export default {
  app: {
    port: 3001
  },
  log: { pretty: true },
  autoload: [{ path: join(import.meta.url, './plugins') }],
  graphiql: {
    enabled: true,
    plugins: [explainGraphiQLPlugin()]
  }
}
