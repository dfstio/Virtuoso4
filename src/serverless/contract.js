const ethers = require("ethers");
const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");
const rpcURL = process.env.RPC_URL; // "https://polygon-mumbai.g.alchemy.com/v2/G_pWY1kSPgCKL3HtsiGxdW9C58QrDZGL";
const contractAddress = "0x49368C4ED51BE6484705F07B63eBD92270923081" ;
const address= "0xbc356b91e24e0f3809fd1E455fc974995eF124dF";

const provider = new ethers.providers.StaticJsonRpcProvider(rpcURL);
const moderatorKey = process.env.MODERATOR_KEY; // "0e942d656a909515342e407f54a11961ca78e771157f292c7d507686ad402b6c";
const REFRESH_INTERVAL_SEC = process.env.REFRESH_INTERVAL_SEC;
const wallet = new ethers.Wallet(moderatorKey);
const signer = wallet.connect(provider);
const virtuoso = new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
const inter = new ethers.utils.Interface(VirtuosoNFTJSON);

//const fetch = require('node-fetch');
const axios = require("axios");
//const {  dbWriteToken, dbReadToken } = require("./dynamodb");
const {  alWriteToken } = require("./algolia");
const TOKEN_JSON = { isLoading: false, isTokenLoaded: false, isPriceLoaded: false, owner: "", name: "", onSale: false };
const DEBUG = true;
const URL = process.env.URL;
const delayMS = 1000;

/*

function getTokenIndex(tokenId)
{
		//console.log("getTokenIndex ", tokenId);
		//let ntokenId = parseInt(tokenId);
		tokenStr = tokenId.toString();
		nToken = parseInt(tokenStr, 10);
		//console.log("getTokenIndex ", tokenStr);
		var id = tokenMap.get(nToken);
		if( id == undefined )
		{
			const newToken = { isLoading: false, isTokenLoaded: false, isPriceLoaded: false, owner: "" };
			tokens.push(newToken);
			id = tokens.length - 1;
			tokenMap.set(nToken,id);
			console.log("Loading token No ", nToken);
		};
		return id;
};
*/

/*
async function apiGetToken(tokenId)
{
       const data = {"tokenId": tokenId.toString()};
       const fullURL = URL + '/api/gettoken-background';
       if(DEBUG) console.log("Fetching ", fullURL, " with data ", data);
       fetch( fullURL, {
       body: JSON.stringify(data),
       method: 'POST'
       });

}

async function apiInitBackground(force)
{
       const data = {"force": force};
       const fullURL = URL + '/api/init-background';
       if(DEBUG) console.log("Fetching ", fullURL, " with data ", data);
       fetch( fullURL, {
       body: JSON.stringify(data),
       method: 'POST'
       });

}
*/

async function initAlgoliaTokens(force)
{
	  const totalSupply = await virtuoso.totalSupply();
	  const chainId = await signer.getChainId();
    const contract = virtuoso.address.toString();

	  if(DEBUG) console.log("initAlgoliaTokens totalSupply: ", totalSupply.toString(), "contract:", contract);


    let i;
	  for( i = 0; i <  totalSupply; i++)
	  {
	    const tokenId = await virtuoso.tokenByIndex(i);
      if(DEBUG) console.log("initTokens Loading token ", tokenId.toString(), " i = ", i);

      let result = await loadAlgoliaToken(tokenId, contract, chainId);
      await sleep(2000);

      if( result == false)
      {
        console.error("initAlgoliaTokens Warning: token No ", tokenId, " is not loaded: ");
        await sleep(2000);
        result = await loadAlgoliaToken(tokenId, contract, chainId);
        if( result == false)
        {
          console.error("initAlgoliaTokens Error: token No ", tokenId, " is not loaded: ");
        };
      };

	  }


//    let result = await loadAlgoliaToken(16, contract, chainId);
	  if(DEBUG) console.log("initAlgoliaTokens finished, totalSupply: ", totalSupply.toString());
	  return totalSupply;
}

async function initTokens(force)
{

	  const totalSupply = await virtuoso.totalSupply();
	  const chainId = await signer.getChainId();
    const contract = chainId.toString() + "." + virtuoso.address.toString();

	  if(DEBUG) console.log("initTokens totalSupply: ", totalSupply.toString(), "contract:", contract);

    let i;
	  for( i = totalSupply - 1; i >= 0; i--)
	  {
	    const tokenId = await virtuoso.tokenByIndex(i);
	    let initForce  = false;
	    if( force == false)
	    {
	        const dbToken = await dbReadToken(tokenId, contract);
	        if( dbToken == undefined ) initForce = true;
	    };

	    if( force == true || initForce == true)
	    {
           if(DEBUG) console.log("initTokens Loading token ", tokenId.toString(), " i = ", i);

           let result = await loadToken(tokenId, contract);
           await sleep(2000);

           if( result == false)
           {
             console.error("initTokens Warning: token No ", i, " is not loaded: ");
             await sleep(2000);
             result = await loadToken(tokenId, contract);
             if( result == false)
             {
               console.error("initTokens Error: token No ", i, " is not loaded: ");
             };
           };
		  };
	  }
	  if(DEBUG) console.log("initTokens finished, totalSupply: ", totalSupply.toString());
	  return totalSupply;

}

function needsUpdate(oldUpdate)
{
    const diff =  (Date.now() - oldUpdate) / 1000;

    if( diff > REFRESH_INTERVAL_SEC) {  return true; }
    else {  return false; }
}


async function getTokenData(body)
{

    //const id = getTokenIndex(tokenId);

    //const token = TOKEN_JSON;
    //console.log("getTokenData contract: ", body);
    const result = await dbReadToken(body.tokenId, body.contract);
    if( result == undefined)
    {
        await apiInitBackground(false);
        return TOKEN_JSON;
    }
    if( body.force == true) // || (result.updated != undefined && needsUpdate(result.updated)))
    {

        //console.log("getTokenData contract updating: ", result);

        //if(result.token != undefined && result.token.isLoading == false)
        //{
        //  result.token.isLoading = true;
        //  await dbWriteToken(tokenId, result.token);
          await apiGetToken(body.tokenId);
        //};
    };

    //apiGetToken(data);
    //console.log("getTokenData result: ", result);
    return result;
}

async function getToken(tokenId)
{
    const chainId = await signer.getChainId();
    const contract = chainId.toString() + "." + virtuoso.address.toString();
    const body = { "tokenId": tokenId, "contract": contract, "force": false};
    const token = await getTokenData(body);
    return token;

}

async function getTokenPrice(tokenId)
{
    let token  = TOKEN_JSON;
    try {
             const uri = await virtuoso.tokenURI(tokenId);
             const tokenuri= await axios.get(uri);;
             const owner = await virtuoso.ownerOf(tokenId);
             if(DEBUG) console.log("loadToken", tokenId.toString(), "uri", tokenuri.data);
             token.uri=tokenuri.data;
             token.owner = owner;


             const saleID = await virtuoso.salesIndex(tokenId);
             if(DEBUG) console.log("loadToken", tokenId.toString(), "saleID", saleID);
             if( saleID == 0 )
             {
               token.onSale = false;
             }
             else
             {
                    const sale = await virtuoso.sales(saleID);

                    if(DEBUG) console.log("loadToken", tokenId.toString(), "sale", sale);

                    if( sale[1] != 1 )
                    {
                      token.onSale = false;
                      token.isPriceLoaded = true;
                    }
                    else
                    {
                      token.onSale = true;
                      const saleConditionsURL = "https://ipfs.io/ipfs/" + sale[2];
                      const saleConditions = await axios.get(saleConditionsURL);
                      if(DEBUG) console.log("loadToken", tokenId.toString(), "saleConditions", saleConditions.data);
                      token.sale = saleConditions.data;
                      token.isPriceLoaded = true;
                     };
              };
 		          return token;


		    } catch (error) {
    			  console.error("loadToken loading token ", tokenId.toString(), " error ", error.code, error.config.url);
    			  return false;
  			};


    return token;

}
async function getTokenDataBackground(tokenId)
{
    const chainId = await signer.getChainId();
    const contract = chainId.toString() + "." + virtuoso.address.toString();
    console.log("getToken contract background: ", tokenId, "contract:", contract);

    const loadResult = await loadToken(tokenId, contract);
    if( loadResult == false)
    {
        console.error("getToken contract background error loading token", tokenId);
        let result = await dbReadToken(tokenId, contract);
        if(result.token != undefined && result.token.isLoading == true)
        {
          result.token.isLoading = false;
          await dbWriteToken(tokenId, result.token, contract);
        };
    };

    return loadResult;
}


async function loadToken(tokenId, contract)
{

   let token  = TOKEN_JSON;
   if(DEBUG) console.log("loadToken", tokenId.toString(), "contract", contract);

    try {
             const uri = await virtuoso.tokenURI(tokenId);
             const tokenuri= await axios.get(uri);;
             const owner = await virtuoso.ownerOf(tokenId);
             //if(DEBUG) console.log("loadToken", tokenId.toString(), "uri", tokenuri.data);
             token.uri=tokenuri.data;
             token.owner = owner;
             token.isTokenLoaded = true;

             const saleID = await virtuoso.salesIndex(tokenId);
             if(DEBUG) console.log("loadToken", tokenId.toString(), "saleID", saleID);
             if( saleID == 0 )
             {
               token.onSale = false;
               token.isPriceLoaded = true;
             }
             else
             {
                    const sale = await virtuoso.sales(saleID);
                    //if(DEBUG) console.log("loadToken", tokenId.toString(), "sale", sale);

                    if( sale[1] != 1 )
                    {
                      token.onSale = false;
                      token.isPriceLoaded = true;
                    }
                    else
                    {
                      token.onSale = true;
                      const saleConditionsURL = "https://ipfs.io/ipfs/" + sale[2];
                      const saleConditions = await axios.get(saleConditionsURL);
                      //if(DEBUG) console.log("loadToken", tokenId.toString(), "saleConditions", saleConditions.data);
                      token.sale = saleConditions.data;
                      token.isPriceLoaded = true;
                     };
              };
              token.isLoading = false;
		          token.name = token.uri.name;
		          if(DEBUG) console.log("loadToken", tokenId.toString(), "write with name", token.name);
		          await dbWriteToken(tokenId, token, contract);
		          return true;


		    } catch (error) {
    			  console.error("loadToken loading token ", tokenId.toString(), " error ", error.code, error.config.url);
    			  return false;
  			};
}

async function loadAlgoliaToken(tokenId, contract, chainId)
{

   let token  = TOKEN_JSON;
   if(DEBUG) console.log("loadToken", tokenId.toString(), "contract", contract);

    try {
             const uri = await virtuoso.tokenURI(tokenId);
             const tokenuri= await axios.get(uri);;
             const owner = await virtuoso.ownerOf(tokenId);
             //if(DEBUG) console.log("loadToken", tokenId.toString(), "uri", tokenuri.data);
             token.uri=tokenuri.data;
             token.owner = owner;
             token.isTokenLoaded = true;

             const saleID = await virtuoso.salesIndex(tokenId);
             if(DEBUG) console.log("loadAlgoliaToken", tokenId.toString(), "saleID", saleID);
             if( saleID == 0 )
             {
               token.onSale = false;
               token.isPriceLoaded = true;
             }
             else
             {
                    const sale = await virtuoso.sales(saleID);
                    //if(DEBUG) console.log("loadToken", tokenId.toString(), "sale", sale);

                    if( sale[1] != 1 )
                    {
                      token.onSale = false;
                      token.isPriceLoaded = true;
                    }
                    else
                    {
                      token.onSale = true;
                      const saleConditionsURL = "https://ipfs.io/ipfs/" + sale[2];
                      const saleConditions = await axios.get(saleConditionsURL);
                      //if(DEBUG) console.log("loadToken", tokenId.toString(), "saleConditions", saleConditions.data);
                      token.sale = saleConditions.data;
                      token.isPriceLoaded = true;

                     };
              };
              token.isLoading = false;
		          token.name = token.uri.name;
		          if(DEBUG) console.log("loadAlgoliaToken", tokenId.toString(), "write with name", token.name);
		          await alWriteToken(tokenId, token, contract, chainId);
		          return true;


		    } catch (error) {
    			  console.error("loadAlgoliaToken loading token ", tokenId.toString(), " error ", error.code, error.config.url);
    			  return false;
  			};
}




async function getBalance(address)
{
    const balance = await virtuoso.virtuosoBalances(address);
    const balance1 = balance / 100;
    console.log("getBalance: ", balance1.toString() );
    return balance1.toString();
}



async function forwardTransaction(txRequest)
{

       try {


    const txCheck = await signer.populateTransaction(txRequest);
    //console.log("forwardTransaction txRequest: ", txRequest );

    //txCheck.chainId = await signer.getChainId();
    //txCheck.nonce = await signer.getTransactionCount();
    console.log("forwardTransaction txCheck: ", txCheck );


    const txSigned = await signer.signTransaction(txCheck);
    //txSigned.chainId = await signer.getChainId();
    //txSigned.nonce = await signer.getTransactionCount();
    console.log("forwardTransaction txSigned: ", txSigned );

    const txResult = await provider.sendTransaction(txSigned);
    console.log("forwardTransaction txResult: ", txResult);

    return txResult;


    } catch (error) {

       console.log("forwardTransaction error: ", error);
       return error;
    }

}

async function setBalance(params)
{
	      	      fetch('http://localhost:8888/api/hello-background', {
                body: JSON.stringify(params),
                method: 'POST'
                });

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function txBackground(body)
{
    console.log("txBackground contract background: ", body);
    const chainId = await signer.getChainId();

    if( body.chainId == chainId)
    {
          await loadTransaction(body.txData, body.chainId);
    }
    else
    {
          console.error("txBackground wrong chain", body, "needs to be on chain", chain);
    }

}

async function loadTransaction(hash, chainId)
{

      const tx = await provider.getTransaction(hash);
      if( DEBUG) console.log("txBackground loadTransaction with hash ", hash, " to ", tx.to, "chainId", chainId );
      let resultwait = await tx.wait(6);
      const contract = chainId.toString() + "." + tx.to.toString();


      if(tx.to == virtuoso.address)
      {

             const decodedInput = inter.parseTransaction({ data: tx.data, value: tx.value});
             const name = decodedInput.name;
             const args = decodedInput.args;
             if( DEBUG) console.log("txBackground loadTransaction confirmations: ", resultwait.confirmations, " function: ", name); //, " args: ", args );

             if( name == "approveSale" ||
                 name == "cancelSale" ||
                 name == "setBlock" ||
                 name == "safeTransferFrom" ||
                 name == "sell" ||
                 name == "transferFrom" ||
                 name == "virtuosoSafeTransferFrom"
                 )
               {
                 const tokenId = args.tokenId;
                 if( DEBUG) console.log("txBackground loadToken ", tokenId.toString(), " on ", name); //, " with args ", args );
                 await loadToken(tokenId, contract);

               };

              if( name == "mintItem" ||
                 name == "mintChildItem"
                 )
               {
                 if( DEBUG) console.log("txBackground initTokens on ", name); //, " with args ", args );
                 await initTokens(false);

               };

      	};
};

async function addBalance( address, amount, description)
{
	console.log("addBalance: address: ", address, "amount: ", amount);

	const balance = await virtuoso.virtuosoBalances(address);
	console.log("old balance: ", parseInt(balance));
	let result = await virtuoso.changeVirtuosoBalance(address, amount, description);
	let resultwait = await result.wait(6);
	console.log("addVirtuosoBalance confirmations: ", resultwait.confirmations);
	const checkbalance = await virtuoso.virtuosoBalances(address);

	if(resultwait.confirmations > 5 )
	{
		console.log("The balance was updated on block ", resultwait.blockNumber, "check new balance: ", parseInt(checkbalance));
		return true;

	}
	else
	{
		console.error("addBalance: Failure to add ", amount, " to ", address, " result: ", resultwait);
		return false;
	};
}

async function transferToken(tokenId, address, credit)
{

	console.log(`transferToken No`, tokenId, " to ", address, " for ",  credit);
	if( address == 'generate')
	{
		console.log(`Address needs to be generated manually`);
		return false;
	};
	const owner = await virtuoso.ownerOf(tokenId);
	await sleep(delayMS);
	const strOwner = owner.toString();
	console.log("owner: ", strOwner);;
	let result = await virtuoso.virtuosoSafeTransferFrom(strOwner, address, tokenId, "", false );
	let resultwait = await result.wait(6);

	const addBalanceAmount = parseInt(credit);
	if( resultwait.confirmations > 5 )
	{
		console.log("Token transferred on block ", resultwait.blockNumber, " confirmations: ", resultwait.confirmations);
		const description = "Sale of token No " + tokenId + " to " + address;
		await addBalance(strOwner, addBalanceAmount, description);
		const chainId = await signer.getChainId();
		const contract = chainId.toString() + "." + virtuoso.address.toString();
		await loadToken(tokenId, contract);
		return true;
	};
	console.error("Failure to transfer token ", tokenId, " to ", address, " from ", strOwner, " for ", credit, "result: ", resultwait);
	return false;
}


module.exports = {
    rpcURL,
    virtuoso,
    provider,
    signer,
    getBalance,
    setBalance,
    getTokenData,
    getTokenPrice,
    getTokenDataBackground,
    txBackground,
    forwardTransaction,
    initTokens,
    addBalance,
    transferToken,
    getToken,
    initAlgoliaTokens
}
