# FASTIFY-AWS-TIMESTREAM

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)  ![CI workflow](__MY_PLUGIN_URL__
/workflows/CI%20workflow/badge.svg)

Supports Fastify versions `3.x`

## Install

```bash
npm i fastify-aws-timestream
```

## Setup [AWS Environments](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)

- *AWS_ACCESS_KEY_ID*: Specifies an AWS access key associated with an IAM user or role.
- *AWS_SECRET_ACCESS_KEY*: Specifies the secret key associated with the access key.
- *AWS_REGION*: The AWS SDK compatible environment variable that specifies the AWS Region to send the request to.

### Custom Environments

- *AWS_DATABASE_NAME*: Database AWS Timestream name

## Usage

Require `fastify-aws-timestream` and register.

```js
const fastify = require('fastify')()

fastify.register(require('fastify-aws-timestream'), {
  // put your options here
})

fastify.listen(3000)
```

## Acknowledgements

## License

Licensed under [MIT](./LICENSE).<br/> 
