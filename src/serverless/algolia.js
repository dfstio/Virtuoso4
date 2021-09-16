const algoliasearch = require('algoliasearch');
const client = algoliasearch('KJYWN9CKS8', 'e362c0f63b9afb700db75abfafecb1aa');
const index = client.initIndex('virtuoso');

async function alWriteToken(tokenId, token, contract, chainId)
{
        const objectID = chainId.toString()+"."+contract.toString()+"."+tokenId.toString();
        let shortdescription = token.uri.description;
        if( shortdescription.length > 100)
        {
          shortdescription = token.uri.description.slice(0,100) + "...";
        };

        // create item to insert
        const params = {
                objectID: objectID,
                contract: contract,
                chainId: chainId,
                tokenId: Number(tokenId),
                vrtTokenId: "VRT1-" + tokenId.toString(),
                owner: token.owner,
                name: token.name,
                description: token.uri.description,
                shortdescription: shortdescription,
                onSale: token.onSale,
                price: token.sale.price,
                currency: token.sale.currency.toUpperCase(),
                category: "Music",
                image: token.uri.image,
                token: token,
                updated: Date.now()
        };
        console.log("Algolia write ",  params);

   try {

        const result = await index.saveObject(params);
        console.log("Algolia write result",  result);


    } catch (error) {

       console.log(" alWriteToken error: ", error);
       return error;
    }

}



module.exports = {
    alWriteToken
}
