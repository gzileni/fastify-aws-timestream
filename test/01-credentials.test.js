const { test } = require('tap')

test('01 - get credentials', async t => {
  const app = require('fastify')()
  app.register(require('..'))
  await app.ready()
  const credentials = await app.timeStreamUtils.credentials()
  console.log('Credentials: ' + credentials)
  t.equal(credentials, process.env.AWS_ACCESS_KEY_ID)
})
