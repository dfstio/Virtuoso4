import api from "./api";
import { getFromIPFS, addToIPFS, getEncryptedFileFromIPFS } from "../blockchain/ipfs";
import { getVirtuosoUnlockableContentKey, metamaskDecrypt, virtuosoSell } from "../blockchain/metamask";
const crypto = require('crypto');


const DEBUG = true;


const operator = async (values) => {
         //if (DEBUG) console.log('sellToken - received values of form: ', values);

         let sellJSON = {
               price: "10",
               type: "fixedprice",
               currency: "usd",
               comment: "",
               contains_unlockable_content: false,
               operator: "",
               };

         sellJSON.price = values.price;
         sellJSON.currency = values.currency;
         sellJSON.comment = values.comment;
         if( values.item.uri.contains_unlockable_content !== undefined ) sellJSON.contains_unlockable_content = values.item.uri.contains_unlockable_content;

		 const operator = await api.sell(values.tokenId, sellJSON);
		 sellJSON.operator = operator.data.operator;
		 //if (DEBUG) console.log('sellToken - operator: ', operator);
		 return { key: operator.data.key, sale: sellJSON };
};

const ipfs = async (data) => {
         const result = await addToIPFS(JSON.stringify(data))
         if(DEBUG) console.log("Uploaded to IPFS with hash ", result.path );
		 return result.path ;
};

function encrypt(toEncrypt, publicKey)
{
       const buffer = Buffer.from(toEncrypt, 'utf8')
       const publicKeyInput = {
            key: Buffer.from(publicKey),
            format: 'der',
            type: 'spki'
        };
       const publicKeyObject = crypto.createPublicKey(publicKeyInput)
       const encrypted = crypto.publicEncrypt(publicKeyObject, buffer)
       return encrypted.toString('base64')
};

const unlockable = async (sellData, operatorData, address) => {
         let newSellKey = "";
         const encryptedKey = await getVirtuosoUnlockableContentKey(sellData.tokenId, address);
         if(DEBUG)  console.log("sell.unlockable- key: ", encryptedKey);

         if( encryptedKey !== "")
         {
             const unlockableIPFS = await getFromIPFS(encryptedKey);
             const unlockableJSON = JSON.parse(unlockableIPFS.toString());

             const password = await metamaskDecrypt( unlockableJSON.key, address );
             if(DEBUG)  console.log("Sale - Decrypted password: ", password);
             const newUnlockableKey = encrypt( password, operatorData.key);
             const newUnlockableJSON = {
                    "data": unlockableJSON.data,
                    "key": newUnlockableKey
                    };
             const newKeyResult = await addToIPFS(JSON.stringify(newUnlockableJSON));
             newSellKey = newKeyResult.path;
         };

         if(DEBUG) console.log("unlockable Uploaded to IPFS with hash ", newSellKey);
		 return newSellKey ;
};

const blockchain = async (tokenId, ipfsHash, operatorAddress, unlockableIPFSHash, address) => {
	     const txresult = await virtuosoSell(tokenId, ipfsHash, operatorAddress, unlockableIPFSHash, address);
         if(DEBUG) console.log("sell.blockchain tx: ", txresult );

};
/*


         sellJSON.operator = operatorAddress;
         if(DEBUG) console.log("UPLOADING Sell JSON...", sellJSON);
         //setSending(true);
         //setIpfsHash();
         const result = await addToIPFS(JSON.stringify(sellJSON))
         if(DEBUG) console.log("Selling NFT with IPFS hash ", result.path )



         let newSellKey = "";
         const encryptedKey = await props.readContracts.VirtuosoNFT.getUnlockableContentKey(id, props.address);
         if(DEBUG)  console.log("Sell - key: ", encryptedKey);

         if( encryptedKey !== "")
         {
             const unlockableIPFS = await getFromIPFS(encryptedKey);
             const unlockableJSON = JSON.parse(unlockableIPFS.toString());

             const password = await props.injectedProvider.send("eth_decrypt", [ unlockableJSON.key, props.address ]);
             if(DEBUG)  console.log("Sale - Decrypted password: ", password);
             const buf = Buffer.from(
                JSON.stringify(
                  sigUtil.encrypt(
                  operatorPublicKey,
                  {data: password},
                  "x25519-xsalsa20-poly1305"
                  )
              ),
              "utf8"
             );

             const newUnlockableKey =  "0x" + buf.toString("hex");
             const newUnlockableJSON = {
                    "data": unlockableJSON.data,
                    "key": newUnlockableKey
                    };
             const newKeyResult = await addToIPFS(JSON.stringify(newUnlockableJSON));
             newSellKey = newKeyResult.path;
         };

         const txresult = await props.tx(props.writeContracts.VirtuosoNFT.sell( id, result.path, operatorAddress , newSellKey));
         if(DEBUG) console.log("NFT sold: ", txresult );
         token.isPriceLoaded = false;
         const index = getTokenIndex(id);
         tokens[index].isPriceLoaded = false;

         const newToken = await getTokenInfo(id, true);
         if( newToken !== undefined)
         {
            token = newToken;
            console.log("TokenView getTokenData attempt No", requestCounter, " token: ", token);
            if( !token.isPriceLoaded || !token.isTokenLoaded )
            {
                      await sleep(1000);
                      requestCounter++;
            }

         }
         else
         {
                  const newToken1 = await getTokenInfo(id, true);
                  if( newToken1 !== undefined)
                  {
                     token = newToken1;
                     console.log("TokenView getTokenData attempt No", requestCounter, " token: ", token);
                     if( !token.isPriceLoaded || !token.isTokenLoaded )
                     {
                               await sleep(1000);
                               requestCounter++;
                     }
                  }

         }


      };

               */



export default {
  operator: operator,
  ipfs: ipfs,
  unlockable: unlockable
}

