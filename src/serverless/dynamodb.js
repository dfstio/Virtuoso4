const AWS = require("aws-sdk");
//require('dotenv').config()

const TABLE_NAME = "Tokens";
const DEBUG = false; 

// destructure env variables
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, MY_AWS_REGION } = process.env;

// gets credentials from ~/.aws/config
AWS.config.update({
    credentials: {
        accessKeyId: MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
    },
    region: MY_AWS_REGION,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();



async function dbWriteToken(tokenId, token, contract)
{
        
        // create item to insert
        const params = {
            TableName: TABLE_NAME,
            Item: {
                contract: contract,
                tokenId: Number(tokenId),
                owner: token.owner,
                name: token.name,
                onSale: token.onSale,
                token: token,
                updated: Date.now()

            },
        };
        console.log("DynamoDB write ",  params);
        
   try {
        let result = await dynamoDb.put(params, function(err, data) {
                    if (err) {
                        console.error("Unable to write item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
                        return data;
                        }
               }).promise();
        //if(DEBUG) console.log("DynamoDB write result: ", result, " params: ",  params);
          
    } catch (error) {

       console.log(" dbWriteToken error: ", error);
       return error;
    }
   
}

async function dbReadToken(tokenId, contract)
{
        var params = { }
        params.TableName = TABLE_NAME;
        
        //const tokenStr = tokenId.toString();
		    //const nToken = parseInt(tokenStr, 10);
		    
        var key = { "contract": contract, "tokenId": Number(tokenId) };
        params.Key = key;
        

        //console.log("DynamoDB read ",  params);
        
   try {
        
        //if(DEBUG) console.log("DynamoDB read params: ",  params);
        let result = await dynamoDb.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        //result = err;
                    } else {
                        //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                        //result = data;
                        }
               }).promise();
        
        
        //if(DEBUG) console.log("DynamoDB read result: ", result.Item );
        return result.Item;
          
    } catch (error) {

       console.log(" dbReadToken error: ", error);
       return error;
    }
   
}

async function dbReadCollection(body)
{
        //var params = { }
        //params.TableName = TABLE_NAME;
        //params.KeyConditionExpression = "tokenId = " 
        
        //const tokenStr = tokenId.toString();
		    //const nToken = parseInt(tokenStr, 10);
        //var key = { "tokenId": Number(tokenId) };
        //params.Key = key;
        
    var params;
    try {        
        if( body.set == "all")
        {
                 params = {
                       TableName : TABLE_NAME,
                       KeyConditionExpression: "#contract = :contract",
                       ProjectionExpression: "tokenId",
                        ExpressionAttributeNames:{
                            "#contract": "contract"
                        },
                        ExpressionAttributeValues: {
                            ":contract": body.contract.toString()
                        },
                       "ScanIndexForward": false,
                       "Limit": Number(body.limit)
                   };
                   if(DEBUG) console.log("DynamoDB dbReadCollection all ",  params);
                    
          } 
          else if( body.set == "my" )
          {
                  params = {
                        TableName : TABLE_NAME,
                        IndexName : "TokensByOwner",
                        KeyConditionExpression: "#owner = :address",
                        ProjectionExpression: "tokenId",
                        ExpressionAttributeNames:{
                            "#owner": "owner"
                        },
                        ExpressionAttributeValues: {
                            ":address": body.address.toString(),
                        },
                        "ScanIndexForward": false,
                         "Limit": Number(body.limit)
                    };
                  

                  if(DEBUG) console.log("DynamoDB dbReadCollection my ",  params);
          };

          let result = await dynamoDb.query(params, function(err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        //result = err;
                    } else {
                        //console.log("getCollection succeeded:", JSON.stringify(data, null, 2));
                        //result = data;
                        }
            }).promise();
            
            return result;
            
          
    } catch (error) {

       console.log(" dbReadCollection error: ", error);
       return error;
    }
   
}

module.exports = {
    dbWriteToken,
    dbReadToken,
    dbReadCollection 
}
