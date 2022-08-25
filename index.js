'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
  fastify.decorate('timestream', async () => {
    return { result: 'ciao' }
  })
}, { fastify: '4.x' })
