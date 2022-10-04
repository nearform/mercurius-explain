'use strict'

/*
resolvePath args has an input like:

{
  "prev": {
    "prev": {
      "key": "users",
      "typename": "Query"
    },
    "key": 0
  },
  "key": "addresses",
  "typename": "User"
}
*/
function resolvePath(structuredPath) {
  if (structuredPath.prev) {
    return `${resolvePath(structuredPath.prev)}.${structuredPath.key}`
  }
  return structuredPath.key
}


class Collector {
  entries = []

  addEntry(path, start, stop) {
    this.entries.push({ path, start, stop })
  }

  export() {
    return this.entries.map((entry) => {
      return {
        path: resolvePath(entry.path),
        start: entry.start,
        stop: entry.stop,
        time: (entry.stop - entry.start) / 1000,
      }
    })
  }
}

module.exports = Collector
