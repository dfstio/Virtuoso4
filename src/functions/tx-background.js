const { txBackground } = require("../serverless/contract");
const logger  = require("../serverless/winston");
const logm = logger.info.child({ winstonModule: 'tx-background' });

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
        //logm.info("txBackground start", {body});
        await txBackground(body);
        await logger.flush();

    } catch (error) {

       logm.error("catch", {error, body:event.body});
       await logger.flush();
    }

};
