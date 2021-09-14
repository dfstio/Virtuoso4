const algoliasearch = require('algoliasearch');
const client = algoliasearch('KJYWN9CKS8', 'e362c0f63b9afb700db75abfafecb1aa');
const index = client.initIndex('virtuoso');

async function alWriteToken(tokenId, token, contract, chainId)
{
        const objectID = chainId.toString()+"."+contract.toString()+"."+tokenId.toString();

        // create item to insert
        const params = {
                objectID: objectID,
                contract: contract,
                chainId: chainId
                tokenId: Number(tokenId),
                owner: token.owner,
                name: token.name,
                description: token.description,
                onSale: token.onSale,
                price: token.sale.price,
                category: "music",
                image: token.image,
                token: token,
                updated: Date.now()
        };
        console.log("Algolia write ",  params);

   try {

        let result = await index.saveObjects(params, { autoGenerateObjectIDIfNotExist: false });


    } catch (error) {

       console.log(" alWriteToken error: ", error);
       return error;
    }

}



module.exports = {
    alWriteToken
}
