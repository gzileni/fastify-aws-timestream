'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('timestream', require('./lib'));
}, { fastify: '3.x' })
