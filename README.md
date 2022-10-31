# Mercurius Explain

A `Mercurius` plugin that exports some execution info in a query.

The additional information currently exported by the plugin are:
* profiling of resolvers execution time
* number of call per resolver

The information is added to the `extensions.explain` attribute in the GQL response.

```js
{
  extensions: {
    explain: {
      version: '1.1.1', // The version in package.json 
      profiler: {
        ...
      },
      resolverCalls: {
        ...
      }
    }
  }
}        
```

### Profiler

The profiler contains the execution time of each resolver called.


- `data` is an `array` with the definition of the profiler entry: 
  - `path` is a `string` that represents the subpath of the resolver
  - `begin` is `number` that represents the start time in **NANOSECONDS**
  - `end` is `number` that represents the end time in **NANOSECONDS**
  - `time` is `number` that represents the time between begin and end in **NANOSECONDS**

**example**
```js
{
  extensions: {
    explain: {
      profiler: {
        data: [
          {
            path: 'user',
            begin: 100, // time in nanoseconds,
            end: 300, // time in nanoseconds,
            time: 200, // time in nanoseconds,
          },
          {
            path: 'user.address',
            begin: 301, // time in nanoseconds,
            end: 400, // time in nanoseconds,
            time: 99, // time in nanoseconds,
          },
          {
            path: 'user.status',
            begin: 301, // time in nanoseconds,
            end: 350, // time in nanoseconds,
            time: 49, // time in nanoseconds,
          },
          ...
        ]
      }
      ...
    }
  }
}
```


### Resolver Calls

Every time a resolver is invoked, a counter keeps track of the call and returns a report with resolverCalls object:

- `data` is an `array` that contains an object for each resolver that has been called:
  - `key` is a string that define the resolver.
  - `count` is a number that define the number of calls for a resolver.

**example**
```js
{
  extensions: {
    explain: {
      resolverCalls: {
        data:data: [
          { key: "Query.users", count: 1 },
          { key: "User.status", count: 2 },
          { key: "User.contacts", count: 2 },
          { key: "Contact.emails", count: 2 }
        ]
      },
      ...
    }
  }
}
```

## Install

```bash
npm i fastify mercurius mercurius-explain
```

## Quickstart

```js
import Fastify from 'fastify'
import mercurius from 'mercurius'
import explain, { explainGraphiQLPlugin } from 'mercurius-explain'

const app = Fastify({ logger: true })

const schema = `
  type Query {
    add(x: Int, y: Int): Int
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
  resolvers,
  graphiql: {
    enabled: true,
    plugins: [explainGraphiQLPlugin()]
  }
})

app.register(explain, {})

app.listen({ port: 3000 })
```

Test:

```bash
curl -X POST -H 'content-type: application/json' -d '{ "query": "{ add(x: 2, y: 2) }" }' localhost:3000/graphql
```

## Options

- `enabled`: `boolean` | `function (schema, source, context) => boolean`. 
  Enables or disables the data collection and the enrichment of the response. By default the action is enabled.

Examples:

```js
// Data enrichment disabled
app.register(explain, {
   enabled: false
}
```

```js
// Data are collected and returned only if the request has 'x-mercurius-explain' header
app.register(explain, {
  enabled: ({ schema, source, context }) =>
    context.reply.request.headers['x-mercurius-explain']
})
```

## Add the viewer plugin to mercurius GraphiQL  (mercurius-explain-graphiql-plugin)

In `mercurius` it is possibile to add to the self hosted GraphiQL app 
the plugin [mercurius-explain-graphiql-plugin](https://github.com/nearform/mercurius-explain-graphiql-plugin) to show the data returned by `mercurius explain`.

### explainGraphiQLPlugin helper
This function return the required structure to initialize the plugin.

`explainGraphiQLPlugin`: `function(options)`
- `options`: `null` | `object`
  - `options.version`: `string`. The Version of the GraphiQL plugin to be loaded. Default: the same major version of the backend plugin

**Example**
```js
import { explainGraphiQLPlugin } from 'mercurius-explain'

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: {
    enabled: true,
    plugins: [explainGraphiQLPlugin()]
  }
})
```

The `explainGraphiQLPlugin` function initialize by default the plugin with the same major version in the `package.json` (eg. if this package is `3.4.5` it will load the version `^3` of the GraphiQL plugin).

It's possible to override the version passing a parameter.

```javascript
...
plugins: [explainGraphiQLPlugin({version: '3.4.5')]

// or 

plugins: [explainGraphiQLPlugin({version: '^4')]
...
```

