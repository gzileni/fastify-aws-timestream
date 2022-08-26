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
 *   database
 * @returns 
 */
const create = async (options) => {
  return new Promise((resolve, reject) => {
    
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME
    }

    writeClient.createDatabase(params).promise().then(data => {
      resolve(`TimeStream Database ${params.DatabaseName} creato con successo.`)
    }, err => {
      reject(err.code === 'ConflictException' ? 
                          `TimeStream Database ${params.DatabaseName} already exists. Skipping creation.` :
                          `Error creating TimeStream Database ${params.DatabaseName}.`)
    })
  })
}

/**
 * 
 * @param {*} options 
 *   database
 * @returns 
 */
const describe = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME
    }
    writeClient.describeDatabase(params).promise().then(data => {
      resolve(`TimeStream Database ID: ${data.Database.Arn}`)
    }, err => {
      reject(err.code === 'ResourceNotFoundExceptions' ?
                          `TimeStream Database ${params.DatabaseName} doesn't exists.` :
                          `Describe TimeStream Database ${params.DatabaseName} failed.`)
    })
  })
}

/**
 * 
 * @param {*} options 
 *   database, kmsKeyID
 * @returns 
 */
const update = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME,
      KmsKeyId: options.kmsKeyID
    }
    writeClient.updateDatabase(params).promise().then((data) => {
      resolve(`Database ${params.DatabaseName} updated kmsKeyId to ${kmsKeyID}`)
    }, (err) => {
      reject(err.code === 'ResourceNotFoundException' ? 
                          `Database ${params.DatabaseName} doesn't exists.` : 
                          `Update Database ${params.DatabaseName} failed.`)
    })
  })
}

/**
 * 
 * @param {*} options 
 *    database
 * @returns 
 */
const del = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: options && options.database ? options.database : process.env.AWS_DATABASE_NAME
    }
    writeClient.deleteDatabase(params).promise().then((data) => {
      resolve(`Database ${params.DatabaseName} deleted.`)
    }, (err) => {
      reject(err.code === 'ResourceNotFoundException' ? 
                          `Database ${params.DatabaseName} doesn't exists.` : 
                          `Delete Database ${params.DatabaseName} failed.`)
    })
  })
}

/**
 * 
 * @param {*} options 
 *    max, nextToken
 * @returns 
 */
const list = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      MaxResults: options && options.max ? options.max : 15
    }

    if (nextToken) {
      params["NextToken"] = options.nextToken
    }

    writeClient.listDatabases(params).promise().then(async data => {
      let databases = data.Databases

      if (data.NextToken) {
        options = {
          ...options,
          nextToken: data.NextToken
        }
        databases = [...await list(options)]
      }

      resolve(databases);

    }, (err) => {
      reject(err.code === 'ResourceNotFoundException' ? 
                          `Database ${params.DatabaseName} doesn't exists.` : 
                          `Delete Database ${params.DatabaseName} failed.`)
    })
  })
}

module.exports = {
  create,
  describe,
  update,
  del,
  list
}
