const ethers = require("ethers");
const VirtuosoNFTJSON = require("../../../subgraph/abis/mumbai_VirtuosoNFT.json");
const rpcURL = "https://polygon-mumbai.g.alchemy.com/v2/G_pWY1kSPgCKL3HtsiGxdW9C58QrDZGL";
const contractAddress = "0x49368C4ED51BE6484705F07B63eBD92270923081" ;
const address= "0xbc356b91e24e0f3809fd1E455fc974995eF124dF";

const provider = new ethers.providers.StaticJsonRpcProvider(rpcURL);
const moderatorKey =  "0e942d656a909515342e407f54a11961ca78e771157f292c7d507686ad402b6c";
const wallet = new ethers.Wallet(moderatorKey);
const signer = wallet.connect(provider);
const virtuoso = new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer); 


exports.handler = async(event, context) => {
    //const { name = "Anonymous" } = event.queryStringParameters;
    console.log("Hello, ", event, context);
    
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


        let result = body;
        result.message = "Hello";
        
        const checkbalance = await virtuoso.virtuosoBalances(body.address);
        const checkbalance1 = checkbalance / 100;
        result.balance = checkbalance1.toString();
        
        const tx = await virtuoso.changeVirtuosoBalance(body.address, body.amount, body.name);
        let resultwait = await tx.wait(6);
	      console.log("changeVirtuosoBalance confirmations: ", result.balance, resultwait.confirmations, resultwait.transactionHash);
	      result.tx = resultwait.transactionHash;
	      result.confirmations = resultwait.confirmations; 


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
                message: error.message,
            }),
        };
    }

};