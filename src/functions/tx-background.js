const { txBackground } = require("../serverless/contract");
const logger  = require("../serverless/winston");
const log = logger.info.child({ winstonModule: 'tx-background' });

exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;



        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "tx-background: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        const body = JSON.parse(event.body);
        logger.initMeta();
        logger.meta.frontendMeta = body.winstonMeta;
        logger.meta.frontendMeta.winstonHost = event.headers.host;
        logger.meta.frontendMeta.winstonIP = event.headers['x-bb-ip'];
        logger.meta.frontendMeta.winstonUserAgent = event.headers['user-agent'];
        logger.meta.frontendMeta.winstonBrowser = event.headers['sec-ch-ua'];

        //logm.info("txBackground start", {body});
        await txBackground(body);
        await logger.flush();

                // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true
            }),
        };


    } catch (error) {

       log.error("catch", {error, body:event.body});
       await logger.flush();
        // return error
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error, success: false
            }),
        };
    }

};
