'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
  fastify.decorate('timeStreamUtils', require('./lib/utils'))
  fastify.decorate('timeStreamWrite', require('./lib/write'))
  fastify.decorate('timeStreamQuery', require('./lib/query'))
}, { fastify: '4.x' })
