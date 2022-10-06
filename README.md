# Mercurius Explain

A Mercurius plugin that exports the execution time of each resolver in a query.
The plugin will add to the response the field `__explain` which containes an array of objects for each time a resolver is invoked.
The object structure:

- `"path"` is a `string` that represents the subpath of the resolver
- `"begin"` is `number` that represents the start time in **NANOSECONDS**
- `"end"` is `number` that represents the end time in **NANOSECONDS**
- `"time"` is `number` that represents the time between begin and end in **NANOSECONDS**

## Install

```bash
npm i fastify mercurius mercurius-explain graphql
```

## Quickstart

```js
import Fastify  from 'fastify'
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
    async add (_, { x, y }, { reply }) {
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
  }
})

app.listen(3000)

```
 
 Test:
```bash
curl -X POST -H 'content-type: application/json' -d '{ "query": "{ add(x: 2, y: 2) }" }' localhost:3000/graphql
```

Response:

```js
{
    "data": {
        "add": 4,
        "__explain": [
            {
                "path": "add",
                "begin": 689330969364333, // nanoseconds
                "end": 689330970336500, // nanoseconds
                "time": 972167 // nanoseconds
            }
        ]
    }
}
```

## Options

- **enabled**

Enables the plugin, default is `false`.
Example:

```js
app.register(explain, {
   enabled: true
 }
```
