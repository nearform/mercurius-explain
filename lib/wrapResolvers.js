function resolvePath({ prev, key }) {
  return prev ? `${resolvePath(prev)}.${key}` : key
}

function resolverCallPath({ fieldName, parentType }) {
  return `${parentType}.${fieldName}`
}

const wrapper = resolver => async (value, args, context, info) => {
  if (!context.mercuriusExplain.enabled || context.mercuriusExplain.gateway)
    return resolver(value, args, context, info)

  context.mercuriusExplain.collector.addResolverCall(resolverCallPath(info))
  const begin = Number(process.hrtime.bigint())
  try {
    const result = await resolver(value, args, context, info)
    const end = Number(process.hrtime.bigint())
    context.mercuriusExplain.collector.addEntry({
      path: resolvePath(info.path),
      begin,
      end,
      time: end - begin
    })
    return result
  } catch (error) {
    const end = Number(process.hrtime.bigint())
    context.mercuriusExplain.collector.addEntry({
      path: resolvePath(info.path),
      begin,
      end,
      error: error.message,
      time: end - begin
    })
    throw error
  }
}

export default function wrapResolvers(schema) {
  for (const schemaType of Object.values(schema.getTypeMap())) {
    if (
      !schemaType.name.startsWith('__') &&
      typeof schemaType.getFields === 'function'
    ) {
      for (const field of Object.values(schemaType.getFields())) {
        if (typeof field.resolve === 'function') {
          field.resolve = wrapper(field.resolve)
        }
      }
    }
  }
}
