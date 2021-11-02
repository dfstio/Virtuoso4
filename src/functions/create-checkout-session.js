const { createCheckoutSession } = require("../serverless/stripe");


exports.handler = async(event, context) => {

        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "createCheckoutSession: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {

        const params = event.queryStringParameters;
        const body = JSON.parse(decodeURIComponent(params.item));
        console.log("createCheckoutSession called: ", body);

        let result = await createCheckoutSession(body);
        //console.log("createCheckoutSession redirect: ", result);

        return {
            statusCode: 303,
            headers: {
                location: result
            }
        };


    } catch (error) {

        // return error
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error,
            }),
        };
    }

};
