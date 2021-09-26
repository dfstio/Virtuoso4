
const { lambdaGetOperator } = require("../serverless/lambda");



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



        //result.message = "Hello";

        //const balance = await getBalance( body.address); //virtuoso.virtuosoBalances(body.address);
        //const balance1 = balance / 100;
        //const checkbalance = balance1.toString();


	      let result = { body: body };
	      //console.log("Hello 1: ", result);
	      let lambda = await lambdaGetOperator(body.action, "80001", "0x49368C4ED51BE6484705F07B63eBD92270923081", body.tokenId, body.text);
	      //console.log("Hello 2: ", lambda);
	      result.lambda = lambda;
	      result.CONTEXT = process.env.CONTEXT ;
	      result.BRANCH = process.env.BRANCH ;
	      result.URL = process.env.URL ;
	      result.DEPLOY_URL = process.env.DEPLOY_URL ;
	      result.DEPLOY_PRIME_URL = process.env.DEPLOY_PRIME_URL ;
	      result.NETWORK_NAME = process.env.NETWORK_NAME ;
	      result.NETWORK_NAME_1 = process.env.NETWORK_NAME_1 ;

        console.log("Hello: ", lambda);


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
