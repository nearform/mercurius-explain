export function extractExplainGateway(context, { profiler, resolverCalls }) {
  if (!context.collectors?.extensions) {
    console.warn('Collectors are empty')
    return
  }

  const extensions = Object.values(context.collectors.extensions)

  if (!extensions.some(extension => extension.data?.explain)) {
    console.warn('Mercurius explain is not enabled on any service')
    return
  }

  for (const extension of extensions) {
    extension.data.explain.profiler.data.forEach(entry => {
      const profile = profiler.find(profile => profile.path === entry.path)
      if (profile) {
        const child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }

        if (!profile.children) {
          profile.children = [child]
          return
        }
        profile.children.push(child)
      }
    })

    extension.data.explain.resolverCalls.data.forEach(entry => {
      const resolverCall = resolverCalls.find(
        resolverCall => resolverCall.key === entry.key
      )
      if (resolverCall) {
        const child = {
          ...entry,
          service: extension.service,
          version: extension.data.explain.version
        }

        if (!resolverCall.children) {
          resolverCall.children = [child]
          return
        }
        resolverCall.children.push(child)
      }
    })
  }
}
