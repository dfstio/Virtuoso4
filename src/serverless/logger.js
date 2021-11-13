import winston from 'winston';
import Transport from 'winston-transport';
import api from "./api";

const { REACT_APP_DEBUG } = process.env;

class VirtuosoTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      api.winston(info);
    });

    // Perform the writing to the remote service
    callback();
  }
};

const transportInfo = [ new VirtuosoTransport() ];
const transportDebug = [ new VirtuosoTransport() ];
if( REACT_APP_DEBUG === 'true')
{
  transportInfo.push(new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: 'info',
            format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
                )
        }));
 transportDebug.push(new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: 'debug',
            format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
                )
        }));
};

const info = new winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: transportInfo,
    exceptionHandlers: transportInfo,
    rejectionHandlers: transportInfo,
    exitOnError: false
});

const debug = new winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: transportDebug,
    exceptionHandlers: transportDebug,
    rejectionHandlers: transportDebug,
    exitOnError: false
});



export default {

info: info,
debug: debug

}

