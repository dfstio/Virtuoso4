const winston = require('winston'),
      WinstonCloudWatch = require('winston-cloudwatch');

const { WINSTON_ID, WINSTON_KEY, WINSTON_NAME, WINSTON_REGION, BRANCH, CHAIN_ID } = process.env;
const logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        })
   ]
});



const cloudwatchConfig = {
    logGroupName:  WINSTON_NAME ,
    logStreamName: `${BRANCH}-${CHAIN_ID}`,
    awsAccessKeyId: WINSTON_ID,
    awsSecretKey: WINSTON_KEY,
    awsRegion: WINSTON_REGION,
    jsonMessage: true
    //messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
};
logger.add(new WinstonCloudWatch(cloudwatchConfig))

module.exports = logger;

