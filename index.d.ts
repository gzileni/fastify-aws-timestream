import { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    // This is an example decorator type added to fastify
    timestream: () => any
  }
}

declare const timestream: FastifyPluginCallback<() => any>

export { timestream }
export default timestream
