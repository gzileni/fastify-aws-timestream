import fastify from 'fastify'
import timestream from '..'
import { expectType } from 'tsd'

let app
try {
  app = fastify()
  app.ready()
  app.register(timestream)
  expectType<() => any>(app.timestream)
} catch (err) {
  console.error(err)
}
