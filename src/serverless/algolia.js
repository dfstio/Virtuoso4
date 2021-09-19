const algoliasearch = require('algoliasearch');
const client = algoliasearch('KJYWN9CKS8', 'e362c0f63b9afb700db75abfafecb1aa');
const index = client.initIndex('virtuoso');

async function alWriteToken(tokenId, token, contract, chainId)
{
        const contractAddress = contract.toString();
        const lowerContractAddress = contractAddress.toLowerCase();
        const objectID = chainId.toString()+"."+lowerContractAddress+"."+tokenId.toString();
        //console.log("Algolia write start", objectID) ;
        let shortdescription = token.uri.description;
        if( shortdescription.length > 100)
        {
          shortdescription = token.uri.description.slice(0,100) + "...";
        };

        // create item to insert
        const params = {
                objectID: objectID,
                contract: lowerContractAddress,
                chainId: chainId,
                tokenId: Number(tokenId),
                vrtTokenId: "VRT1-" + tokenId.toString(),
                updated: Date.now(),
                owner: token.owner,
                name: token.uri.name,
                description: token.uri.description,
                shortdescription: shortdescription,
                saleID: token.saleID,
                onSale: token.onSale,
                saleStatus: token.saleStatus,
                price: token.sale.price,
                currency: token.sale.currency.toUpperCase(),
                category: "Music",
                image: token.uri.image,
                uri: token.uri,
                sale: token.sale

        };
        //console.log("Algolia write ",  params);

   try {

        const result = await index.saveObject(params);
        console.log("Algolia write result for token",  tokenId.toString(), "is ", result);


    } catch (error) {

       console.log(" alWriteToken error: ", error);
       return error;
    }

}

async function alDeleteToken(tokenId, token, contract, chainId)
{
        const contractAddress = contract.toString();
        const lowerContractAddress = contractAddress.toLowerCase();
        const objectID = chainId.toString()+"."+lowerContractAddress+"."+tokenId.toString();


   try {

        const result = await index.deleteObject(objectID);
        console.log("Algolia delete result for ", objectID, "is",  result);


    } catch (error) {

       console.log(" alDeleteToken error: ", error);
       return error;
    }

}



module.exports = {
    alWriteToken,
    alDeleteToken,
}
