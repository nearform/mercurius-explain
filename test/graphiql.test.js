import { readFileSync } from 'fs'
import { test } from 'node:test'
import semver from 'semver'

import { explainGraphiQLPlugin } from '../index.js'

const fileUrl = new URL('../package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

test('graphiql add on with default version', async t => {
  const graphiqlPlugin = explainGraphiQLPlugin()
  t.assert.ok(graphiqlPlugin.name)
  t.assert.ok(graphiqlPlugin.umdUrl)
  t.assert.ok(graphiqlPlugin.fetcherWrapper)

  t.assert.deepStrictEqual(graphiqlPlugin, {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@^${semver.major(
      packageJSON.version
    )}/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  })
})

test('graphiql add on with specified version', async t => {
  const graphiqlPlugin = explainGraphiQLPlugin({ version: '2.1.2-alpha' })
  t.assert.ok(graphiqlPlugin.name)
  t.assert.ok(graphiqlPlugin.umdUrl)
  t.assert.ok(graphiqlPlugin.fetcherWrapper)

  t.assert.deepStrictEqual(graphiqlPlugin, {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@2.1.2-alpha/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  })
})
