# Mercurius Explain

A Mercurius plugin that exports the execution time of each resolver in a query.

The plugin adds an attribute in the `extensions` structure.

```js
{
  extensions: {
    explain: {
      profiler: {
        data: [
          {
            path: 'the-path-of-the-query',
            begin: 123, // time in nanoseconds,
            end: 123, // time in nanoseconds,
            time: 123, // time in nanoseconds,
          },
          ...
        ]
      },
      resolverCalls: {
        data: [
          {
            "Query.user": {
              count: 1
            },
            "User.contacts": {
              count: 2
            }
          },
        ]
      },
    }
  }
}
```

The profiler object structure:

- `"path"` is a `string` that represents the subpath of the resolver
- `"begin"` is `number` that represents the start time in **NANOSECONDS**
- `"end"` is `number` that represents the end time in **NANOSECONDS**
- `"time"` is `number` that represents the time between begin and end in **NANOSECONDS**

Every time a resolver is invoked, a property is added to the resolverCalls object:

- the key is `Type.Resolver`
- the value is an object with the property `count` that indicates how many times the resolver has been invoked

## Install

```bash
npm i fastify mercurius mercurius-explain graphql
```

## Quickstart

```js
import Fastify from 'fastify'
import mercurius from 'mercurius'
import explain from 'mercurius-explain'

const app = Fastify({ logger: true })

const schema = `
  type Query {
    add(x: Int, y: Int): Int
    hello: String
  }
`

const resolvers = {
  Query: {
    async add(_, { x, y }, { reply }) {
      return x + y
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers
})

app.register(explain, {
  enabled: true // enable must be explicit
})

app.listen({ port: 3000 })
```

Test:

```bash
curl -X POST -H 'content-type: application/json' -d '{ "query": "{ add(x: 2, y: 2) }" }' localhost:3000/graphql
```

## Options

- **enabled**

The option `enabled`, enables or disables the plugin, type is `boolean` or `function`, by default is set to `true`.
If `function`, the function must return a `boolean` value, the plugin will pass to the function the following graphQL object:

```js
{
  schema, source, context
}
```

Example:

```js
// plugin disabled
app.register(explain, {
   enabled: false
}
```

```js
// enabled only if the request has 'explain' header
app.register(explain, {
  enabled: ({ schema, source, context }) =>
    context.reply.request.headers['explain']
})
```
