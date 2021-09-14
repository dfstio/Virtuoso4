const { getTokenData } = require("../serverless/contract");
                 
exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;

    
    
        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "getToken: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {

        // parse form data
        const body = JSON.parse(event.body);
        //console.log("getToken: ", body);
        
        let result = await getTokenData(body);
        //let result  = { isLoading: false, isTokenLoaded: false, isPriceLoaded: false, owner: "" };
        //console.log("getToken: ", body.tokenId, body.force, result);

        // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: result.token,
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