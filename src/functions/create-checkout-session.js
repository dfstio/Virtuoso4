const { createCheckoutSession } = require("../serverless/stripe");

exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;



        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "createCheckoutSession: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {

        // parse form data
        console.log("createCheckoutSession called 1: ", event.queryStringParameters);
        const body = event.queryStringParameters;
        console.log("createCheckoutSession called 2: ", body);
        //console.log("getToken: ", body);

        let result = await createCheckoutSession(body);
        //let result  = { isLoading: false, isTokenLoaded: false, isPriceLoaded: false, owner: "" };
        console.log("createCheckoutSession redirect: ", result);
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
