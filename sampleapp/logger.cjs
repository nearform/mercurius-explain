'use strict'

const pino = require('pino')

module.exports = (options) => {
  return pino(
    {
      name: 'mercurius-explain',
      level: options.level || 'info',
      formatters: {
        level(label) {
          return { level: label.toUpperCase() }
        },
      },
    },
    pino.destination({ sync: false })
  )
}
