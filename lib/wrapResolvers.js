function resolvePath({ prev, key }) {
  return prev ? `${resolvePath(prev)}.${key}` : key
}

const wrapper = resolver => async (value, args, context, info) => {
  try {
    const begin = Number(process.hrtime.bigint())
    const result = await resolver(value, args, context, info)
    const end = Number(process.hrtime.bigint())
    context.mercuriusExplainCollector.addEntry({
      path: resolvePath(info.path),
      begin,
      end,
      time: end - begin
    })
    return result
  } catch (error) {
    console.error(error)
    return error
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
