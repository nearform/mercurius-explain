export class Collector {
  constructor() {
    this.entries = []
    this.resolverCalls = new Map()
  }

  addResolverCall(key) {
    this.resolverCalls.has(key)
      ? this.resolverCalls.set(key, {
          count: this.resolverCalls.get(key).count + 1
        })
      : this.resolverCalls.set(key, { count: 1 })
  }

  addEntry(entry) {
    this.entries.push(entry)
  }

  exportEntries() {
    return this.entries
  }

  exportResolversCalls() {
    return Object.fromEntries(this.resolverCalls)
  }
}
