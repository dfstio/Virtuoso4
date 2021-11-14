const WinstonCloudWatch = require('winston-cloudwatch');

const { WINSTON_ID, WINSTON_KEY, WINSTON_NAME, WINSTON_REGION, BRANCH, CHAIN_ID } = process.env;





exports.handler = async(event, context) => {

        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        // parse form data
        console.log( "Winston", event, context);

        let body = JSON.parse(event.body);
        body.winstonBranch = BRANCH;
        body.winstonChainId = CHAIN_ID;
        body.winstonLevel = 'info';
        body.winstonRepo = 'frontend';
        body.winstonHost = event.headers.host;
        const cloudwatchConfig = {
                   logGroupName:  WINSTON_NAME ,
                   logStreamName: `${BRANCH}-${CHAIN_ID}`,
                   awsAccessKeyId: WINSTON_ID,
                   awsSecretKey: WINSTON_KEY,
                   awsRegion: WINSTON_REGION,
                   jsonMessage: true
                   //messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
               };
        console.log("Winston", body);
        const transport = new WinstonCloudWatch(cloudwatchConfig);
	      function myfunc() {};
	      transport.log(body, myfunc);
	      transport.kthxbye(myfunc);




        // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
            }),
        };

    } catch (error) {

        // return error
        console.log("Winston error", error);
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error,
            }),
        };
    }

};
