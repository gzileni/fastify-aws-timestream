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
  }
})

/**
 * Get Credentials
 * @returns
 */
const credentials = async () => {
  return new Promise((resolve, reject) => {
    AWS.config.getCredentials((err) => {
      if (err) {
        reject(err.stack)
      } else {
        resolve(AWS.config.credentials.accessKeyId)
      }
    })
  })
}

/**
 * create database AWS TimeStream
 * @param {*} database
 * @returns
 */
const createDatabase = async (database) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: database || process.env.AWS_DATABASE_NAME
    }
    writeClient.createDatabase(params).promise().then((data) => {
      resolve(data.Database.DatabaseName)
    }, (err) => {
      reject(err.code)
    })
  })
}

/**
 *
 * @param {*} database
 * @returns
 */
const describeDatabase = async (database) => {
  return new Promise((resolve, reject) => {
    const params = {
      DatabaseName: database || process.env.AWS_DATABASE_NAME
    }
    writeClient.describeDatabase(params).promise().then((data) => {
      resolve(data.Database.Arn)
    }, (err) => {
      reject(err.code)
    })
  })
}

module.exports = {
  createDatabase,
  describeDatabase,
  credentials
}
