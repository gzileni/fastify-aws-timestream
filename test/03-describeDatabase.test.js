const { test } = require('tap')

test('03 - describe database', async t => {
  const app = require('fastify')()

  app.register(require('..'))

  await app.ready()
  const result = await app.timeStreamWrite.describeDatabase()
  console.log(result)
  t.equal(result, 'ResourceNotFoundException', `Database ${process.env.AWS_DATABASE_NAME} doesn't exists.`)
})
