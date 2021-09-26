const { txBackground } = require("../serverless/contract");

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
        await txBackground(body);

    } catch (error) {

       console.error("tx-background error: ", error);
    }

};
