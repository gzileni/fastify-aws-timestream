'use strict'

const AWS = require('aws-sdk')

/**
 *
 */
const queryClient = new AWS.TimestreamQuery()

module.exports = {
  queryClient
}
