import fp from 'fastify-plugin'
import mercuriusPlugin from 'mercurius-plugin'

export default fp(
  async fastify => {
    fastify.register(mercuriusPlugin, { enabled: true })
  },
  {
    name: 'mercurius-explain',
    dependencies: ['mercurius']
  }
)
