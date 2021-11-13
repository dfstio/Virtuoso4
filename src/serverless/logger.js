const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const { REACT_APP_WINSTON_ID, REACT_APP_WINSTON_KEY, REACT_APP_WINSTON_NAME, REACT_APP_WINSTON_REGION, NODE_ENV } = process.env;
const export logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        })
   ]
});
console.log("NODE_ENV", NODE_ENV);
if (NODE_ENV === 'production')
{
  const cloudwatchConfig = {
    logGroupName: REACT_APP_WINSTON_NAME },
    logStreamName: `${REACT_APP_WINSTON_NAME }}-${NODE_ENV}`,
    awsAccessKeyId: REACT_APP_WINSTON_ID,
    awsSecretKey: REACT_APP_WINSTON_KEY,
    awsRegion: REACT_APP_WINSTON_REGION,
    messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
}
    logger.add(new WinstonCloudWatch(cloudwatchConfig))
}
//module.exports = logger;
