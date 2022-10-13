export class Collector {
  constructor() {
    this.entries = []
  }

  addEntry(entry) {
    this.entries.push(entry)
  }

  export() {
    return {
      profiler: {
        data: this.entries
      }
    }
  }
}
