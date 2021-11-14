const winston = require('winston'),
      WinstonCloudWatch = require('winston-cloudwatch');

const { WINSTON_ID, WINSTON_KEY, WINSTON_NAME, WINSTON_REGION, BRANCH, CHAIN_ID } = process.env;

const cloudwatchConfig = {
    level: 'info',
    logGroupName:  WINSTON_NAME ,
    logStreamName: `${BRANCH}-${CHAIN_ID}`,
    awsAccessKeyId: WINSTON_ID,
    awsSecretKey: WINSTON_KEY,
    awsRegion: WINSTON_REGION,
    jsonMessage: true
    //messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
};

const transportInfo = [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: 'info',
            format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
                )
        }),
        new WinstonCloudWatch(cloudwatchConfig)
   ];

const transportDebug = [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: 'debug',
            format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
                )
        }),
        new WinstonCloudWatch(cloudwatchConfig)
   ];


const debug = new winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { winstonBranch: BRANCH, winstonChainId: CHAIN_ID, winstonLevel: 'debug', winstonRepo: 'functions' },
    transports: transportDebug,
    exceptionHandlers: transportDebug,
    rejectionHandlers: transportDebug
});

const info = new winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { winstonBranch: BRANCH, winstonChainId: CHAIN_ID, winstonLevel: 'info', winstonRepo: 'functions'  },
    transports: transportInfo,
    exceptionHandlers: transportInfo,
    rejectionHandlers: transportInfo
});

async function flush()
{
    await new Promise( (resolve) => { transportInfo[1].kthxbye(resolve) } );
    await new Promise( (resolve) => { transportDebug[1].kthxbye(resolve) } );
};

module.exports = { info, debug, flush };

