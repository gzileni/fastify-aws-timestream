const { test } = require('tap')

test('02 - create database', async t => {
  t.plan(3)
  const app = require('fastify')()
  app.register(require('..'))
  await app.ready()
  app.timeStreamDatabase.createDatabase().then(result => {
    console.log(result)
    t.equal(result, process.env.AWS_DATABASE_NAME, `Database ${result} created successfully.`)
  }).catch(e => {
    console.log('error: ' + e)
    t.equal(e, 'ConfigError', `${process.env.AWS_DEFAULT_REGION} - Database: ${process.env.AWS_DATABASE_NAME}`)
    t.equal(e, 'ConflictExeception', `Database ${process.env.AWS_DATABASE_NAME} on already exists. Skipping creation.`)
  })
})
