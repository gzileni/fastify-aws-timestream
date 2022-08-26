'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
  fastify.decorate('timeStreamUtils', require('./lib/utils'))
  fastify.decorate('timeStreamDatabase', require('./lib/database'))
  fastify.decorate('timeStreamTable', require('./lib/table'))
  fastify.decorate('timeStreamQuery', require('./lib/query'))
}, { fastify: '4.x' })
