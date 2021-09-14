const { initTokens } = require("../serverless/contract");
        
                          
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
        let force = true;
        if( body.force != undefined && body.force == false) force = false;
        
        let result = await initTokens(force);
        console.log("init-background: ", result.toString(), " tokens");

        // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: result,
            }),
        };

    } catch (error) {
       console.error("init-background error: ", error);
    }

};