const { dbReadCollection } = require("../serverless/dynamodb");
                      
                  
exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;

    
    
        // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "getCollection: You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {

        // parse form data
        const body = JSON.parse(event.body);
        console.log("getCollection: ", body);
        
        let result = await dbReadCollection(body);

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