'use strict'

const AWS = require('aws-sdk')
const https = require('https')

/** */
const agent = new https.Agent({
  maxSocket: 5000 // max connections
})

/**
 *
 */
const writeClient = new AWS.TimestreamWrite({
  maxRetries: 10, // SDK Retry count
  httpOptions: {
    timeout: 20000, // Request timeout
    agent
  },
  region: process.env.AWS_DEFAULT_REGION
})

/**
 *
 * @param {*} options
 *  database, table, memory, hour, days
 * @returns
 */
const create = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      TableName: options && options.table ? options.table : process.env.AWS_TABLE_NAME,
      RetentionProperties: {
        MemoryStoreRetentionPeriodInHours: options && options.hour ? options.hour : 24,
        MagneticStoreRetentionPeriodInDays: options && options.days ? options.days : 365
      }
    }

    if (options && options.memory) {
      params.MagneticStoreWriteProperties = {
        EnableMagneticStoreWrites: options.memory
      }
    };

    writeClient.createTable(params).promise().then((data) => {
      resolve(`Table ${params.TableName} created successfully.`)
    }, (err) => {
      const error = err.code === 'ConflictException'
        ? `Table ${params.TableName} already exists on ${params.DatabaseName}. Skipping creation.`
        : `Error creating table ${params.TableName} on ${params.DatabaseName}`
      reject(error)
    })
  })
}

/**
 *
 * @param {*} options
 *  database, table
 * @returns
 */
const describe = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      TableName: options && options.table ? options.table : process.env.AWS_TABLE_NAME
    }

    writeClient.describeTable(params).promise().then((data) => {
      resolve(`Table ${params.TableName} has id ${data.Table.Arn}.`)
    }, (err) => {
      const error = err.code === 'ResourceNotFoundException'
        ? `Table ${params.TableName} or ${params.DatabaseName} doesn't exists.`
        : `Describe table ${params.TableName} on ${params.DatabaseName} failed.`
      reject(error)
    })
  })
}

/**
 *
 * @param {*} options
 *  database, hour, days
 * @returns
 */
const update = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      TableName: options && options.table ? options.table : process.env.AWS_TABLE_NAME,
      RetentionProperties: {
        MemoryStoreRetentionPeriodInHours: options && options.hour ? options.hour : 24,
        MagneticStoreRetentionPeriodInDays: options && options.days ? options.days : 365
      }
    }

    writeClient.updateTable(params).promise().then((data) => {
      resolve(`Table ${params.TableName} updated.`)
    }, (err) => {
      const error = `Error updating table ${params.TableName} on ${params.DatabaseName}.\n${err}`
      reject(error)
    })
  })
}

/**
 *
 * @param {*} options
 *  database, table
 * @returns
 */
const del = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      TableName: options && options.table ? options.table : process.env.AWS_TABLE_NAME
    }

    writeClient.deleteTable(params).promise().then((data) => {
      resolve(`Table ${params.TableName} deleted.`)
    }, (err) => {
      const error = err.code === 'ResourceNotFoundException'
        ? `Table ${params.TableName} or ${params.DatabaseName} doesn't exists.`
        : `Error deleting table ${params.TableName} on ${params.DatabaseName}.`
      reject(error)
    })
  })
}

/**
 *
 * @param {*} options
 *    dimensions, data, database, table
 * @returns
 */
const write = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      TableName: options && options.table ? options.table : process.env.AWS_TABLE_NAME,
      Records: options.data
    }

    writeClient.writeRecords(params).promise().then((data) => {
      resolve(data)
    }, (err) => {
      reject(err)
    })
  })
}

/**
 *
 * @param {*} options
 *    database, max, nextToken
 * @returns
 */
const list = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      MaxResults: options && options.max ? options.max : 15
    }

    if (options.nextToken) {
      params.NextToken = options.nextToken
    }

    writeClient.listTables(params).promise().then(async data => {
      let tables = data.Tables

      if (data.NextToken) {
        options = {
          ...options,
          nextToken: data.NextToken
        }
        tables = [...await list(options)]
      }

      resolve(tables)
    }, (err) => {
      const error = `Error while listing Database ${params.DatabaseName}.\n${err}`
      reject(error)
    })
  })
}

module.exports = {
  create,
  describe,
  update,
  del,
  list,
  write
}
