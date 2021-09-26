const AWS = require("aws-sdk");
const crypto = require('crypto');
const DEBUG = true;

// destructure env variables
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, MY_AWS_REGION, LAMBDA_KEY, KEY_CONTEXT } = process.env;

// gets credentials from ~/.aws/config
AWS.config.update({
    credentials: {
        accessKeyId: MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
    },
    region: MY_AWS_REGION,
});

var lambda = new AWS.Lambda();


async function lambdaGetOperator(action, chainId, contract, tokenId, text)
{



       const payload = {
                key: LAMBDA_KEY,
                action: action,
                chainId: chainId,
                contract: contract,
                tokenId: Number(tokenId),
                context: KEY_CONTEXT,

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
        //console.log("lambdaGetOperator params",  params, );
        let result = await lambda.invoke(params).promise();
        /*
        , function(err, data) {
                    if (err) {
                        console.error("lambdaGetOperator invoke error:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("lambdaGetOperator succeeded:", JSON.stringify(data, null, 2));
                        //return data;
                        }
               }).promise(); */

        const resultJSON = JSON.parse(result.Payload.toString());
        resultJSON.encryptedText = encrypt(text, resultJSON.keyPair.PublicKey);
        resultJSON.decryptedText = decrypt( resultJSON.encryptedText, resultJSON.keyPair.PrivateKeyPlaintext );
        //if(DEBUG) console.log("lambdaGetOperator result: ", resultJSON, " params: ",  params);
        return resultJSON;

    } catch (error) {

       console.log("lambdaGetOperator error: ", error);
       return error;
    }

}

function encrypt(toEncrypt, publicKey)
{
       const buffer = Buffer.from(toEncrypt, 'utf8')
       const publicKeyInput = {
            key: Buffer.from(publicKey),
            format: 'der',
            type: 'spki'
        };
       console.log("encrypt", publicKeyInput);
       const publicKeyObject = crypto.createPublicKey(publicKeyInput)
       const encrypted = crypto.publicEncrypt(publicKeyObject, buffer)
       return encrypted.toString('base64')
}

function decrypt(toDecrypt, privateKey)
{
       const buffer = Buffer.from(toDecrypt, 'base64')
       const privateKeyInput = {
            key: Buffer.from(privateKey),
            format: 'der',
            type: 'pkcs8'
        };

       const privateKeyObject = crypto.createPrivateKey(privateKeyInput);

       const decrypted = crypto.privateDecrypt(privateKeyObject, buffer);

       /*
         {
           key: privateKeyObject.toString(),
           passphrase: '',
         },
         buffer,
       )
       */
       return decrypted.toString('utf8')
};


module.exports = {
    lambdaGetOperator
}
