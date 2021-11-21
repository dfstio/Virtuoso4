const { lambdaAddBalance } = require("../serverless/lambda");
const {  REACT_APP_RELAY_KEY } = process.env;

exports.handler = async(event, context) => {

    console.log("Start event:", event, "context:", context);
        // check for POST
    if (event.httpMethod !== "POST")
    {
        console.log("POST required");
        return {
            statusCode: 400,
            body: "You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        // parse form data
        const body = JSON.parse(event.body);
        console.log("body", body);
        let result = "failed";
	      //if( BRANCH === 'mumbai') result = await lambdaAddBalance(body.address, body.amount, body.description);
	      if( body.key === undefined || body.key !== REACT_APP_RELAY_KEY)
	      {
	           console.error("wrong key");
	      }
	      else
	      {
	          console.log("Requesting adding balance", body);
	          result = await lambdaAddBalance(body.address, body.amount, body.description);
	      };
        console.log("Result: ", result);

        // return success
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: result,
            }),
        };

    } catch (error) {
        console.error("Error", error);
        // return error
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error,
            }),
        };
    }

};
