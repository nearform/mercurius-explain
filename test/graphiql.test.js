import { readFileSync } from 'fs'
import { test } from 'tap'
import semver from 'semver'

import { explainGraphiQLPlugin } from '../index.js'

const fileUrl = new URL('../package.json', import.meta.url)
const packageJSON = JSON.parse(readFileSync(fileUrl))

test('graphiql add on with default version', async t => {
  const graphiqlPlugin = explainGraphiQLPlugin()
  t.hasProps(graphiqlPlugin, ['name', 'umdUrl', 'fetcherWrapper'])

  t.same(graphiqlPlugin, {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@^${semver.major(
      packageJSON.version
    )}/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  })
})

test('graphiql add on with specified version', async t => {
  const graphiqlPlugin = explainGraphiQLPlugin('2.1.2-alpha')
  t.hasProps(graphiqlPlugin, ['name', 'umdUrl', 'fetcherWrapper'])

  t.same(graphiqlPlugin, {
    name: 'mercuriusExplain',
    umdUrl: `https://unpkg.com/mercurius-explain-graphiql-plugin@2.1.2-alpha/dist/umd/index.js`,
    fetcherWrapper: 'parseFetchResponse'
  })
})
