'use strict'

const fastify = require('fastify')

const config = require('./config.cjs')
const logger = require('./logger.cjs')
const services = require('./app.cjs')

const app = fastify({
  logger: logger(config.log),
  disableRequestLogging: config.log.disableRequestLogging,
})

app.register(services(config))

app.addHook('onClose', (instance, done) => {
  closeListeners.uninstall()
  done()
})

async function run(fastifyApp) {
  await fastifyApp.listen(config.app.port, '0.0.0.0')
}

run(app).catch((err) => {
  app.log.fatal(err, 'error starting app')
  process.exit(1)
})
