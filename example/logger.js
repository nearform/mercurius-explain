import pino from 'pino'

export default options => {
  return pino(
    {
      name: 'mercurius-explain',
      level: options.level || 'info',
      formatters: {
        level(label) {
          return { level: label.toUpperCase() }
        }
      }
    },
    pino.destination({ sync: false })
  )
}
