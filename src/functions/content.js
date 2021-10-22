const { lambdaContent} = require("../serverless/lambda");

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
        const body = JSON.parse(event.body);
	      const result = await lambdaContent(body.tokenId, body.data);
        //console.log("Sell API: ", result);

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
