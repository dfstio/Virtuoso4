const AWS = require("aws-sdk");
const DEBUG = true;

// destructure env variables
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, MY_AWS_REGION, LAMBDA_KEY } = process.env;

// gets credentials from ~/.aws/config
AWS.config.update({
    credentials: {
        accessKeyId: MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
    },
    region: MY_AWS_REGION,
});

var lambda = new AWS.Lambda();


async function lambdaGetOperator(action, chainId, contract, tokenId)
{



       const payload = {
                key: LAMBDA_KEY,
                action: action,
                chainId: chainId,
                contract: contract,
                tokenId: Number(tokenId),

        };



        const params = {
          FunctionName: 'getOperator', /* required */
          //ClientContext: 'STRING_VALUE',
          InvocationType: 'RequestResponse',
          LogType: 'None', //None Tail
          Payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      };


        //console.log("lambdaGetOperator params",  params, );

   try {
        console.log("lambdaGetOperator params",  params, );
        let result = await lambda.invoke(params, function(err, data) {
                    if (err) {
                        console.error("lambdaGetOperator invoke error:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("lambdaGetOperator succeeded:", JSON.stringify(data, null, 2));
                        //return data;
                        }
               }).promise();

        const resultJSON = JSON.parse(result.Payload.toString());
        if(DEBUG) console.log("lambdaGetOperator result: ", resultJSON, " params: ",  params);
        return resultJSON;

    } catch (error) {

       console.log("lambdaGetOperator error: ", error);
       return error;
    }

}

module.exports = {
    lambdaGetOperator
}
