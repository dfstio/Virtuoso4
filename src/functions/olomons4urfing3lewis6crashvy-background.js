const { checkoutCompleted } = require("../serverless/stripe");

exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;



        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "olomons4urfing3lewis6crashvy: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        //const body = JSON.parse(event.body);
        //console.log("olomons4urfing3lewis6crashvy", body, event, context);
        await checkoutCompleted (event.body, event.headers);

    } catch (error) {

       console.error("olomons4urfing3lewis6crashvy error: ", error);
    }

};
