const AWS = require("aws-sdk");
var https = require('https');

var agent = new https.Agent({
    maxSocket: 5000 // max connections
});

const writeClient = new AWS.TimestreamWrite({
    maxRetries: 10,  // SDK Retry count
    httpOptions: {
        timeout: 20000, // Request timeout
        agent: agent
    },
    region: "eu-central-1"
});

const queryClient = new AWS.TimestreamQuery({
    region: "eu-central-1"
});

/**
 * get credentials
 * @returns 
 */
const credentials = async () => {
    
    return new Promise((resolve, reject) => {
        AWS.config.getCredentials((err) => {
            if (err) {
                console.log(err.stack);
                reject(err.stack);
            } else {
                resolve(AWS.config.credentials.accessKeyId)
            }
        });
    });
};

/**
 * create database
 * @param {*} database 
 * @returns 
 */
const createDatabase = async (database) => {
    return new Promise((resolve, reject) => {

        const params = {
            DatabaseName: database ? database : process.env.AWS_DATABASE_NAME
        }

        const promise = writeClient.createDatabase(params).promise();
        promise.then((data) => {
            resolve(`Database ${params.DatabaseName} created successfully.`)
        }, (err) => {
            if (err.code === 'ConflictException') {
                reject(`Database ${params.DatabaseName} already exists. Skipping creation.`)
            } else {
                reject(`Error creating database ${params.DatabaseName}.`)
            }
        })
    });
}

module.exports = {
    credentials,
    writeClient,
    queryClient,
    createDatabase
}