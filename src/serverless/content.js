import api from "./api";
import { getAddress } from "../blockchain/metamask";

//const EthCrypto = require('eth-crypto');
const {REACT_APP_CONTRACT_ADDRESS,  REACT_APP_CHAIN_ID, REACT_APP_RELAY_KEY} = process.env;
const DEBUG = true;


export async function getOnLoad(tokenId, signature, time)
{
         //if (DEBUG) console.log('sellToken - received values of form: ', values);
    const address = await getAddress();
    let contentJSON = {
               tokenId: tokenId,
               type: "onload",
               address: address,
               signature: signature,
               time: time
               };

		 const result = await api.content(tokenId, contentJSON);
		 if (DEBUG) console.log('Content - result ', result);
		 if( result.success === true && result.data.success === true) return result.data;
		 else return {success: false};
};

export async function getContentMessage(tokenId)
{
         //if (DEBUG) console.log('sellToken - received values of form: ', values);
    const address = await getAddress();
    let contentJSON = {
               tokenId: tokenId,
               type: "signature",
               address: address,
               signature: ""
               };

		 const result = await api.content(tokenId, contentJSON);
		 if (DEBUG) console.log('Signature - result ', result);
		 if( result.success === true && result.data.success === true) return result.data;
		 else return {success: false};
};

/*
async function ethEncrypt(toEncrypt, publicKey)
{
      const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, toEncrypt);
      return EthCrypto.cipher.stringify(encrypted);
};


async function ethDecrypt(toDecrypt, privateKey)
{
    const data = EthCrypto.cipher.parse(toDecrypt);
    const decrypted = await EthCrypto.decryptWithPrivateKey(privateKey, data);
    return decrypted;

};

*/



