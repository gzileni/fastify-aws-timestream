const { test } = require('tap')

test('should register the correct decorator', async t => {
  t.plan(1)

  const app = require('fastify')()

  app.register(require('..'))

  await app.ready()

  t.same(app.timestream(), 'decorated')
})

test('get credentials', async t => {
  t.plan(1)

  const app = require('fastify')()

  app.register(require('..'))

  await app.ready()
  const credentials = await app.timestream().credentials()
  console.log(credentials)
})
