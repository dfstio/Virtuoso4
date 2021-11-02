
const { relayCall } = require("../serverless/contract");
const {  REACT_APP_RELAY_KEY} = process.env;



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

        console.log("Relay call:", event.body);

        if( body.key === undefined || body.key !== REACT_APP_RELAY_KEY)
        {
            console.error("Relay call: wrong key");
            return {
                   statusCode: error.statusCode || 500,
                   body: JSON.stringify({
                       message: "Relay call: wrong key",
                       success: false
                   }),
               };

        };
        const {to, newTokenURI, unlockableContentKey, onEscrow, dynamicUri} = body.data;
        const result = await relayCall("mintItem", [to, newTokenURI, unlockableContentKey, onEscrow, dynamicUri]);


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
                success: false
            }),
        };
    }

};
