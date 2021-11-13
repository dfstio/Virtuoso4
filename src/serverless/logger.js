import winston from 'winston';
import Transport from 'winston-transport';

class VirtuosoTransport extends Transport {
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      //this.emit('logged', info);
      console.log("VirtuosoTransport", info);
    });

    // Perform the writing to the remote service
    callback();
  }
};





const logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        }),
        new VirtuosoTransport()
   ]
});







export default logger;

