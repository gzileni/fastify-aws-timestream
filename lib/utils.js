'use strict'

const AWS = require('aws-sdk')

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

module.exports = {
  credentials
}
