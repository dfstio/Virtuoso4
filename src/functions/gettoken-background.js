const { getTokenDataBackground } = require("../serverless/contract");
        
exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;

    
    
        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "getToken-background: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        const body = JSON.parse(event.body);        
        await getTokenDataBackground(body.tokenId);

    } catch (error) {

       console.error("gettoken-background error: ", error);
    }

};