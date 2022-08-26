import { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    timeStreamDatabase: () => any
    timeStreamTable: () => any
    timeStreamQuery: () => any
    timeStreamUtils: () => any
  }
}

declare const timeStreamDatabase: FastifyPluginCallback<() => any>
declare const timeStreamTable: FastifyPluginCallback<() => any>
declare const timeStreamQuery: FastifyPluginCallback<() => any>
declare const timeStreamUtils: FastifyPluginCallback<() => any>

export { timeStreamDatabase, timeStreamQuery, timeStreamUtils, timeStreamTable }
export default timeStreamDatabase
