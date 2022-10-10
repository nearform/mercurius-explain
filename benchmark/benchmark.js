import autocannon from 'autocannon'
import { writeFileSync } from 'fs'
import startServer from './server.js'
import stripAnsi from 'strip-ansi'

async function benchmark() {
  console.log('Benchmark started')
  let output = `## Benchmark Results\n\n
  The query is:
  \`\`\`
  {
    query: \`{
      users {
        name
        status {
          enabled
        }
        addresses {
          zip
        }
      }
  }\`
  \`\`\`\n`

  output += await runBenchmark({
    title: 'Mercurius Explain Enabled',
    enabled: true
  })
  output += await runBenchmark({
    title: 'Mercurius Explain Disabled',
    enabled: false
  })
  output += await runBenchmark({
    title: 'Mercurius Explain Enabled with 50s resolver timeout',
    enabled: true,
    timeout: 50
  })
  output += await runBenchmark({
    title: 'Mercurius Explain Disabled with 50s resolver timeout',
    enabled: false,
    timeout: 50
  })
  writeFileSync(`./benchmark/benchmark.md`, stripAnsi(output))
}

async function runBenchmark(opts) {
  const app = await startServer(opts)
  const instance = await autocannon({
    url: `http://127.0.01:3002/graphql`,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: `{
        users {
          name
          status {
            enabled
          }
          addresses {
            zip
          }
        }
    }`
    }),
    connections: 10,
    duration: 10
  })
  await app.close()
  return `### ${opts.title}\n\`\`\`${autocannon.printResult(instance)}\`\`\`\n`
}

benchmark()
