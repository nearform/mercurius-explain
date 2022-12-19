export function extractExplainGateway(context, { profiler, resolverCalls }) {
  if (!context.collectors?.extensions) {
    context.app.log.warn('Collectors are empty')
    return
  }

  const extensions = Object.values(context.collectors.extensions)

  if (!extensions.some(extension => extension.data?.explain)) {
    context.app.log.warn('Mercurius explain is not enabled on any service')
    return
  }

  for (const extension of extensions) {
    extension.data.explain.profiler.data.forEach(entry => {
      const profile = profiler.find(profile => profile.path === entry.path)
      if (profile) {
        profile.child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }
      }
    })

    extension.data.explain.resolverCalls.data.forEach(entry => {
      const resolverCall = resolverCalls.find(
        resolverCall => resolverCall.key === entry.key
      )
      if (resolverCall) {
        resolverCall.child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }
      }
    })
  }
}
