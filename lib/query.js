'use strict'

const AWS = require('aws-sdk')

/**
 *
 */
const queryClient = new AWS.TimestreamQuery({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

/**
 *
 * @param {*} info
 * @returns
 */
const _parseColumnName = (info) => {
  return info.Name == null ? '' : `${info.Name}=`
}

/**
 *
 * @param {*} info
 * @param {*} datum
 */
const _parseScalarType = (info, datum) => {
  return _parseColumnName(info) + datum.ScalarValue
}

/**
 *
 * @param {*} info
 * @param {*} datum
 * @returns
 */
const _parseTimeSeries = (info, datum) => {
  const timeSeriesOutput = []
  datum.TimeSeriesValue.forEach((dataPoint) => {
    timeSeriesOutput.push(`{time=${dataPoint.Time}, value=${_parseDatum(info.Type.TimeSeriesMeasureValueColumnInfo, dataPoint.Value)}}`)
  })
  return `[${timeSeriesOutput.join(', ')}]`
}

/**
 *
 * @param {*} arrayColumnInfo
 * @param {*} arrayValues
 */
const _parseArray = (arrayColumnInfo, arrayValues) => {
  const arrayOutput = []
  arrayValues.forEach((datum) => {
    arrayOutput.push(_parseDatum(arrayColumnInfo, datum))
  })
  return `[${arrayOutput.join(', ')}]`
}

/**
 *
 * @param {*} info
 * @param {*} datum
 * @returns
 */
const _parseDatum = (info, datum) => {
  if (datum.NullValue != null && datum.NullValue === true) {
    return `${info.Name}=NULL`
  }

  const columnType = info.Type

  /** If the column is of TimeSeries Type */
  if (columnType.TimeSeriesMeasureValueColumnInfo != null) {
    return _parseTimeSeries(info, datum)
  } else if (columnType.ArrayColumnInfo != null) {
    /** If the column is of Array Type */
    return `${info.Name}=${_parseArray(info.Type.ArrayColumnInfo, datum.ArrayValue)}`
  } else if (columnType.RowColumnInfo != null) {
    /** if the column if of Row Type */
    return _parseRow(info.Type.RowColumnInfo, datum.RowValue)
  } else {
    /** if the columnis of Scalar Type */
    return _parseScalarType(info, datum)
  }
}

/**
 *
 * @param {*} columnInfo
 * @param {*} row
 */
const _parseRow = (columnInfo, row) => {
  const rowOutput = []

  for (let i = 0; i < row.Data.length; i++) {
    const item = _parseDatum(columnInfo[i], row.Data[i])
    rowOutput.push(item)
  }

  return `{${rowOutput.join(', ')}}`
}

/**
 *
 * @param {*} response
 * @returns
 */
const _parseQueryResult = (response) => {
  const rows = response.Rows.map(row => {
    return _parseRow(response.ColumnInfo, row)
  })

  const r = {
    queryID: response.QueryId,
    queryStatus: response.QueryStatus,
    columnInfo: response.ColumnInfo,
    rows
  }

  return r
}

/**
 *
 * @param {*} sql
 * @param {*} nextToken
 * @returns
 */
const get = async (options) => {
  return new Promise((resolve, reject) => {
    /** OPTIONS
     * database, table, query, nextToken
     */

    const db = options && options.database ? options.database : process.env.AWS_DATABASE_NAME

    const params = {
      QueryString: options && options.query ? options.query : `SELECT * FROM ${db}.${options.table}`
    }

    if (options.nextToken) {
      params.NextToken = options.nextToken
    };

    queryClient.query(params).promise().then(async (response) => {
      let data = _parseQueryResult(response)
      if (response.NextToken) {
        options = {
          ...options,
          nextToken: response.NextToken
        }
        data = [...await get(options)]
      }
      resolve(data)
    }, (err) => {
      reject(err)
    })
  })
}

/**
 *
 * @param {*} options
 *   name,
     toDatabase,
     toTable,
     query,
     scheduled_cron,
     timeColumn,
     dimensions,
     mappings,
     topicArn,
     roleArn,
     s3ErrorReportBucketName
 * @returns
 */
const create = async (options) => {
  return new Promise((resolve, reject) => {
    const timestreamConfiguration = {
      DatabaseName: options && options.toDatabase ? options.toDatabase : process.env.AWS_DATABASE_NAME,
      TableName: options.toTable,
      TimeColumn: options.timeColumn,
      DimensionMappings: options.dimensions,
      MultiMeasureMappings: {
        TargetMultiMeasureName: options.name,
        MultiMeasureAttributeMappings: options.mappings
      }
    }

    const createScheduledQueryRequest = {
      Name: options.name,
      QueryString: options.query,
      ScheduleConfiguration: {
        ScheduleExpression: options.scheduled_cron ? options.scheduled_cron : 'cron(0 0 * * * *)'
      },
      TargetConfiguration: {
        TimestreamConfiguration: timestreamConfiguration
      },
      NotificationConfiguration: {
        SnsConfiguration: {
          TopicArn: options.topicArn ? options.topicArn : '******'
        }
      },
      ScheduledQueryExecutionRoleArn: options.roleArn ? options.roleArn : '******',
      ErrorReportConfiguration: {
        S3Configuration: {
          BucketName: options.s3ErrorReportBucketName ? options.s3ErrorReportBucketName : '******',
          ObjectKeyPrefix: 'errors',
          EncryptionOption: 'SSE_S3'
        }
      }
    }

    queryClient.createScheduledQuery(createScheduledQueryRequest).promise().then(data => {
      resolve(data.Arn)
    }, error => {
      reject(error)
    })
  })
}

/**
 *
 * @param {*} options
 *   scheduledQueryArn, invocationTime
 */
const run = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      ScheduledQueryArn: options.scheduledQueryArn,
      InvocationTime: options.invocationTime // The timestamp in UTC. Query will be run as if it was invoked at this timestamp
    }
    queryClient.executeScheduledQuery(params).promise().then(data => {
      resolve(data)
    }, err => {
      reject(err)
    })
  })
}

/**
 * list all Scheduled Queries
 * @param {*} options
 *    max, nextToken
 * @returns
 */
const list = async (options) => {
  let result = []

  try {
    let params = {
      MaxResults: options && options.max ? options.max : 15,
      NextToken: options && options.nextToken ? options.nextToken : null
    }

    do {
      const data = await queryClient.listScheduledQueries(params).promise()
      const scheduledQueryList = data.ScheduledQueries
      result = [...new Set([...result, ...scheduledQueryList])]
      params = {
        ...params,
        NextToken: data.NextToken
      }
    } while (params.NextToken != null)

    return {
      err: null,
      data: result
    }
  } catch (err) {
    return {
      err,
      data: null
    }
  }
}

/**
 *
 * @param {*} options
 *   ScheduledQueryArn
 * @returns
 */
const del = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      ScheduledQueryArn: options.scheduledQueryArn
    }

    queryClient.deleteScheduledQuery(params).promise().then((data) => {
      resolve(`Successfully deleted scheduled query. ${data}`)
    }, (err) => {
      const error = `Scheduled Query deletion failed. ${err}`
      reject(error)
    })
  })
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * delete all scheduled query
 */
const delAll = async () => {
  const queries = await list()

  for (let i = 0; i < queries.data.length; i++) {
    await del({ scheduledQueryArn: queries.data[i].Arn })
    console.log(`Waiting ${i} seconds...`)
    await sleep(i * 1000)
  }
}

/**
 *
 * @param {*} options
 *  scheduledQueryArn, disable
 * @returns
 */
const setOnOff = async (options) => {
  return new Promise((resolve, reject) => {
    const params = {
      ScheduledQueryArn: options.scheduledQueryArn,
      State: options && options.disable ? 'DISABLED' : 'ENABLED'
    }

    queryClient.updateScheduledQuery(params).promise().then((data) => {
      resolve(`Successfully updated scheduled query state to ${params.State}. ${data}`)
    }, (err) => {
      const error = `Update Scheduled Query failed. ${err}`
      reject(error)
    })
  })
}

module.exports = {
  get,
  create,
  run,
  list,
  del,
  delAll,
  setOnOff
}
