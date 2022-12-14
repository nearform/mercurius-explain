import fp from 'fastify-plugin'

export default fp(
  async fastify => {
    fastify.register(import('../../index.js'), { enabled: true })
  },
  {
    name: 'mercurius-explain',
    dependencies: ['mercurius']
  }
)
