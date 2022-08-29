# FASTIFY-AWS-TIMESTREAM

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)  ![CI workflow](https://github.com/gzileni/fastify-aws-timestream/workflows/CI%20workflow/badge.svg)

Supports Fastify versions `4.x`

FASTIFY-AWS-TIMESTREAM Fastify plugins for managing databases, tables and querying and creating scheduled queries with [**AWS Timestream**](https://aws.amazon.com/it/timestream/).

**AWS Timestream** is a fast, scalable, serverless, fully managed, purpose-built time series database that makes it easy to store and analyze trillions of time series data points per day.

Examples of a growing list of use cases for AWS Timestream include:
- Monitoring metrics to improve the performance and availability of your applications.
- Storage and analysis of industrial telemetry to streamline, equipment management and maintenance.
- Tracking user interaction with an application overtime.
- Storage and analysis of IoT sensor data

## Install

```bash
npm i --save fastify-aws-timestream
```

and setup default environments:

```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_DEFAULT_REGION=us-west-2
export AWS_DATABASE_NAME="myDatabase"
export AWS_TABLE_NAME="myTable"
```

### [AWS Environments](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)

- *AWS_ACCESS_KEY_ID*: Specifies an AWS access key associated with an IAM user or role.
- *AWS_SECRET_ACCESS_KEY*: Specifies the secret key associated with the access key.
- *AWS_DEFAULT_REGION*: The AWS SDK compatible environment variable that specifies the AWS Region to send the request to.

### Custom Environments

- *AWS_DATABASE_NAME*: AWS Timestream database name
- *AWS_TABLE_NAME*: AWS Timestream table name

## Usage

Require `fastify-aws-timestream` and register.

```js
const fastify = require('fastify')()
fastify.register(require('fastify-aws-timestream'))
fastify.listen(3000)
```

## Storage

When data is stored in Timestream data is organized in time order as well as across time based on context attributes written with the data. Timestream offers two data stores – an **in-memory store** and a cost-effective **magnetic store**, and it supports configuring table level policies to automatically transfer data across stores. 

### Database
You can first create database a top level container for tables. 
#### Options

Options|Method|Optional|Default value
:---|:---|:---|:---
*database*|create, describe, update, del|yes|AWS_DATABASE_NAME
*kmsKeyID*|update|no|
*max*|list|yes|15
*nextToken*|list|yes|

#### fastify.timeStreamDatabase.create(options)

```js
  fastify.timeStreamDatabase.create().then(result => {
    console.log(result);
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamDatabase.describe(options)
```js
  fastify.timeStreamDatabase.describe().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamDatabase.update(options)
```js
  fastify.timeStreamDatabase.update({ kmsKeyID: 'xxxxxxxxxx' }).then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamDatabase.del(options)
```js
  fastify.timeStreamDatabase.del().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamDatabase.list(options)
```js
  fastify.timeStreamDatabase.list().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```
### Table
A database contains 0 or more tables, each table contains 0 or more time series. Each time series consists of a sequence of records over a given time interval at a specified granularity. Each time series can be described using its meta-data or dimensions, its data or measures, and its timestamps.

Incoming high throughput data writes land in the memory store where data is optimized for writes, as well as reads performed around current time for powering dashboard and alerting type queries. When the main time-frame for writes, alerting, and dashboarding needs has passed, allowing the data to automatically flow from the memory store to the magnetic store to optimize cost. Timestream allows setting a data retention policy on the memory store for this purpose. Data writes for late arrival data are directly written into the magnetic store.
Once the data is available in the magnetic store (because of expiration of the memory store retention period or because of direct writes into the magnetic store), it is reorganized into a format that is highly optimized for large volume data reads. The magnetic store also has a data retention policy that may be configured if there is a time threshold where the data outlives its usefulness. When the data exceeds the time range defined for the magnetic store retention policy, it is automatically removed. 

#### Options

Options|Method|Optional|Default value
:---|:---|:---|:---
*database*|create, describe, update, del|yes|AWS_DATABASE_NAME
*table*|create, describe, update, del|yes|AWS_TABLE_NAME
*memory*|create|yes|true
*hour*|create, update|yes|24
*days*|create, update|yes|365
*max*|list|yes|15
*nextToken*|list|yes|
*dimensions*|write|no|
*data*|write|no|

#### fastify.timeStreamTable.create(options)

```js
  fastify.timeStreamTable.create().then(result => {
    console.log(result);
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamTable.describe(options)
```js
  fastify.timeStreamTable.describe().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamTable.update(options)
```js
  fastify.timeStreamTable.update({ hour: 4, days: 30 }).then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamTable.del(options)
```js
  fastify.timeStreamTable.del().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamTable.list(options)
```js
  fastify.timeStreamTable.list().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

#### fastify.timeStreamTable.write(options)

You can collect time series data from connected devices, IT systems, and industrial equipment, and write it into Timestream. Timestream enables you to write data points from a single time series and/or data points from many series in a single write request when the time series belong to the same table.

Amazon Timestream offers the ability to write data using two types of records, namely, **single-measure records** and **multi-measure records**. **Single-measure records** enable you to send a single measure per record. When data is sent to Timestream using this format, Timestream creates one table row per record.

FASTIFY-AWS-TIMESTREAM write data by **multi-measure records**, you can store multiple measures in a single table row, instead of storing one measure per table row. Multi-measure records therefore enable you to migrate your existing data from relational databases to Amazon Timestream with minimal changes.

The following are the benefits of using *multi-measure records*:
- **Performance and cost**: Multi-measure records enable you to write multiple time-series measures in a single write request. This increases the write throughput and also reduces the cost of writes. With multi-measure records, you can store data in a more compact manner, which helps lower the data storage costs. The compact data storage of multi-measure records results in less data being processed by queries. This is designed to improve the overall query performance and help lower the query cost.
- **Query simplicity**: With multi-measure records,you do not need to write complex commontable expressions (CTEs) in a query to read multiple measures with the same timestamp. This is because the measures are stored as columns in a single table row. Multi-measure records therefore enable writing simpler queries.
- **Data modeling flexibility** You can write future timestamps into Timestream by using the TIMESTAMP data type and multi-measure records. A multi-measure record can have multiple attributes of TIMESTAMP data type, in addition to the time field in a record. TIMESTAMP attributes, in a multi- measure record, can have timestamps in the future or the past and behave like the time field except that Timestream does not index on the values of type TIMESTAMP in a multi-measure record.

```js

  const dimensions = [{
      "name": "appartment",
      "value": "xxx"
    },
    {
      "name": "room",
      "value": "yyy"
    },
    {
      "name": "sensor",
      "value": "zzz"
    }
  ];

  const dataStream = [
    {
      "name": "enable",
      "value": 1
    },
    {
      "name": "temperature",
      "value": 33
    }
  ];

  const options = {
    dimensions: dimensions,
    data: dataStream
  }

  fastify.timeStreamTable.write(options).then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

### Query
AWS Timestream queries are expressed in a SQL grammar that has extensions for time series-specific support (time series-specific data types and functions), so the learning curve is easy for developers already familiar with SQL.

#### fastify.timeStreamQuery.get()
Select all Records from table

```js
  fastify.timeStreamQuery.get().then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```
For example, the JSON response is the following:

```json
{
    "queryID": "AEFACANGRMVGBPSX46UAHJI7LGKVNUNPGZH7PSGH2P5ROFW2OWJKGCL4YQ3RJ4I",
    "queryStatus": {
        "ProgressPercentage": 100,
        "CumulativeBytesScanned": 310,
        "CumulativeBytesMetered": 10000000
    },
    "columnInfo": [
        {
            "Name": "appartment",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "database",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "sensor",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "region",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "room",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "table",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "measure_name",
            "Type": {
                "ScalarType": "VARCHAR"
            }
        },
        {
            "Name": "time",
            "Type": {
                "ScalarType": "TIMESTAMP"
            }
        },
        {
            "Name": "measure_value::double",
            "Type": {
                "ScalarType": "DOUBLE"
            }
        }
    ],
    "rows": [
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=temperature, time=2022-08-25 17:59:51.115000000, measure_value::double=27.0}",
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=temperature, time=2022-08-25 18:01:56.611000000, measure_value::double=29.0}",
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=temperature, time=2022-08-25 18:14:54.584000000, measure_value::double=30.0}",
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=enable, time=2022-08-25 17:59:51.115000000, measure_value::double=1.0}",
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=enable, time=2022-08-25 18:01:56.611000000, measure_value::double=1.0}",
        "{appartment=xxx, database=titiro, sensor=zzz, region=eu-central-1, room=yyy, table=titiro, measure_name=enable, time=2022-08-25 18:14:54.584000000, measure_value::double=1.0}"
    ]
}
```

#### Scheduled Query
The scheduled query feature in Amazon Timestream is a fully managed, serverless, and scalable solution for calculating and storing aggregates, rollups, and other forms of preprocessed data typically used to power operational dashboards, business reports, ad-hoc analytics, and other applications. Scheduled queries make real-time analytics more performant and cost-effective, so you can derive additional insights from your data, and can continue to make better business decisions.
With scheduled queries, you define the real-time analytics queries that compute aggregates, rollups, and other operations on the data—and Amazon Timestream periodically and automatically runs these queries and reliably writes the query results into a separate table. The data is typically calculated and updated into these tables within a few minutes.

The following are the benefits of scheduled queries:
- **Operational ease** :Scheduled queries are serverless and fully managed. All you need to do is define the required inputs, and Amazon Timestream will take care of the rest.
- **Performance and cost**: Because scheduled queries precompute the aggregates,rollups,orother real-time analytics operations for your data and store the results in a table, queries that access tables populated by scheduled queries contain less data than the source tables. Therefore, queries that are run on these tables are faster and cheaper. Tables populated by scheduled computations contain less data than their source tables, and therefore help reduce the storage cost. You can also retain this data for a longer duration in the memory store at a fraction of the cost of retaining the source data in the memory store.
- **Interoperability**: Tables populated by scheduled queries offer all of the existing functionality of Timestream tables and can be used with all of the services and tools that work with Timestream

##### Options

Options|Optional|Default value|Description
:---|:---|:---|:---
*name*|no| |Query name
*toDatabase*|yes|AWS_DATABASE_NAME|target database
*toTable*|yes|AWS_TABLE_NAME|target table
*query*|no| | Query to execute
*scheduled_cron*|yes|cron(0/1 * * * ? *)|Allows you to specify when your scheduled query instances are run. You can specify the expressions using a cron expression
*timeColumn*|no| | Time column name
*dimensions*|no| | Dimension Mapping List
*mapping*|no| | Mapping List
*topicArn*|yes| | Timestream automatically runs instances of a scheduled query based on your schedule expression. You receive a notification for every such query run on an SNS topic that you configure when you create a scheduled query. 
*roleArn*|yes| | Permission
*s3ErrorReportBucketName*|yes| | If an instance encounters any errors (for example, invalid data which could not be stored), the records that encountered errors are written to an error report in the error report location you specify at creation of a scheduled query. You specify the S3 bucket and prefix for the location. Timestream appends the scheduled query name and invocation time to this prefix to help you identify the errors associated with a specific instance of a scheduled query

##### fastify.timeStreamQuery.create(options)
```js

  const timeColumn = "binned_timestamp";
  const query = "SELECT region, az, hostname, BIN(time, 15s) AS binned_timestamp, " +
        " ROUND(AVG(cpu_utilization), 2) AS avg_cpu_utilization, " +
        " ROUND(APPROX_PERCENTILE(cpu_utilization, 0.9), 2) AS p90_cpu_utilization, " +
        " ROUND(APPROX_PERCENTILE(cpu_utilization, 0.95), 2) AS p95_cpu_utilization, " +
        " ROUND(APPROX_PERCENTILE(cpu_utilization, 0.99), 2) AS p99_cpu_utilization " +
        "FROM " + DATABASE_NAME + "." + TABLE_NAME + " " +
        "WHERE measure_name = 'metrics' " +
        " AND hostname = '" + HOSTNAME + "' " +
        " AND time > ago(2h) " +
        "GROUP BY region, hostname, az, BIN(time, 15s) " +
        "ORDER BY binned_timestamp ASC " +
        "LIMIT 5";

  const DimensionMappingList = [
    {
      'Name': 'region',
      'DimensionValueType': 'VARCHAR'
    },
    {
      'Name': 'az',
      'DimensionValueType': 'VARCHAR'
    },
    {
      'Name': 'hostname',
      'DimensionValueType': 'VARCHAR'
    }
  ];

  const MultiMeasureMappings = {
    TargetMultiMeasureName: "multi-metrics",
    MultiMeasureAttributeMappings: [{
            'SourceColumn': 'avg_cpu_utilization',
            'MeasureValueType': 'DOUBLE'
        },
        {
            'SourceColumn': 'p90_cpu_utilization',
            'MeasureValueType': 'DOUBLE'
        },
        {
            'SourceColumn': 'p95_cpu_utilization',
            'MeasureValueType': 'DOUBLE'
        },
        {
            'SourceColumn': 'p99_cpu_utilization',
            'MeasureValueType': 'DOUBLE'
        },
  ]};

  const options = {
    name: 'myQueryScheduled',
    toTable: 'myQuery',
    timeColumn: timeColumn,
    dimensions: DimensionMappingList,
    mapping: MultiMeasureMappings,
    query: query
  }

  fastify.timeStreamQuery.create(options).then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

##### fastify.timeStreamQuery.run(options)

Options|Optional|Default value|Description
:---|:---|:---|:---
*scheduledQueryArn*|no| |Query scheduled Arn
*invocationTime*|no| |The timestamp in UTC. Query will be run as if it was invoked at this timestamp

```js

  const options = {
    scheduledQueryArn: 'xxxxxxxxxx',
    invocationTime: '2018-11-11T12:07:22.3+05:00'
  }

  fastify.timeStreamQuery.run(options).then(result => {
    console.log(result)
  }).catch(e => {
    console.log(e);
  });
```

## Acknowledgements
- [Developer Guide](https://docs.aws.amazon.com/timestream/latest/developerguide/what-is-timestream.html)
## License

Licensed under [MIT](./LICENSE)
