import { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    // This is an example decorator type added to fastify
    timeStreamWrite: () => any
    timeStreamQuery: () => any
    timeStreamUtils: () => any
  }
}

declare const timeStreamWrite: FastifyPluginCallback<() => any>
declare const timeStreamQuery: FastifyPluginCallback<() => any>
declare const timeStreamUtils: FastifyPluginCallback<() => any>

export { timeStreamWrite, timeStreamQuery, timeStreamUtils }
export default timeStreamWrite
