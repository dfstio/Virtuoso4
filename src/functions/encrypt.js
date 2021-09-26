
const { encrypt } = require("../serverless/lambda");



exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;

    //console.log("Hello, ", event, context);

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
        const body = JSON.parse(event.body);
	      let result = await encrypt(body.data, body.key);
        console.log("Encrypt: ", result);


        //let result = await forwardTransaction(body);


        // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: result,
            }),
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
