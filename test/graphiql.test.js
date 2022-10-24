import { test } from 'tap'

import { explainGraphiQLPlugin } from '../index.js'

test('graphiql add on', async t => {
  const graphiqlPlugin = explainGraphiQLPlugin()
  t.hasProps(graphiqlPlugin, ['name', 'umdUrl', 'fetcherWrapper'])
  const res = await fetch(graphiqlPlugin.umdUrl)
  t.equal(res.status, 200)
})
