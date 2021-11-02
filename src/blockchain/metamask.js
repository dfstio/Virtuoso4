import api from "../serverless/api";
import {relayFunction} from "../relay/relayclient";
import {message} from 'antd';
import {isMobile} from 'react-device-detect';
// SET TARGET NETWORK
//const {NETWORKS} = require("../constants/Blockchain.js");

//export const network = NETWORKS.mumbai; // IMPORTANT
const MINIMUM_BALANCE  = 1e17; // to switch to relay

const ethers = require("ethers");
const VirtuosoNFTJSON = require("../contract/NFTVirtuoso.json");

//const REACT_APP_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
//const rpcUrlMetaMask = process.env.REACT_APP_RPCURL_METAMASK;
const {REACT_APP_CONTRACT_ADDRESS, REACT_APP_CHAIN_ID, REACT_APP_RPCURL_METAMASK, REACT_APP_NETWORK_TOKEN,
      REACT_APP_NETWORK_NAME, REACT_APP_NETWORK_HEXCHAIN_ID, REACT_APP_NETWORK_EXPLORER} = process.env;


var provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
var signer = provider && provider.getSigner();
var readVirtuoso = provider && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, provider);
const DEBUG = true;
const DEBUGM = true;



export async function initVirtuoso(handleEvents )
{

        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        if(DEBUG) console.log("initVirtuoso called on chain", chainId);

         if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
         {
           provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
           readVirtuoso = provider && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, provider);
           if( readVirtuoso )
           {
              readVirtuoso.removeAllListeners();
              //readVirtuoso.on({}, handleEvents);
              if(DEBUG) console.log("initVirtuoso success on chain", chainId);
           };
         } else console.log("Cannot init virtuoso - wrong chain", chainId, ",needs to be", REACT_APP_NETWORK_NAME, REACT_APP_NETWORK_HEXCHAIN_ID);

};

export async function initAccount(handleEvents, handleChainChanged, handleAccountsChanged )
{

     let address = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {

        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        await initVirtuoso();
        const account =  await window.ethereum.request({method: 'eth_accounts'});
        const chainId =  await window.ethereum.request({method: 'eth_chainId'});

        if(DEBUG) console.log("initAccount account", account, chainId);


         if((account.length > 0) && (chainId === REACT_APP_NETWORK_HEXCHAIN_ID))
         {
           address = ethers.utils.getAddress(account[0]);

         }
     };


     if(DEBUG) console.log("metamask initAccount address: ", address );

     return address;
};

export async function getAddress(force = false)
{
    if(DEBUG) console.log("getAddress called");
     let address = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        let account = [];
        if( force ) account =  await window.ethereum.request({method: 'eth_requestAccounts'});
        else account =  await window.ethereum.request({method: 'eth_accounts'});
        if(DEBUG) console.log("getAddress account", account, chainId);


         if((account.length > 0 ) && (chainId === REACT_APP_NETWORK_HEXCHAIN_ID))
         {
           address = ethers.utils.getAddress(account[0]);

         }
     };

     return address;
};

export async function metamaskDecrypt(key, address)
{

     let result = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {

            try {
                   result =  await window.ethereum.request(
                        { method: 'eth_decrypt',
                          params: [ key, address],
                        });

                  } catch (error) {
                      console.error( "metamaskDecrypt error", error);
                      return "";
                  };

     };
     if(DEBUG) console.log("metamaskDecrypt called", key, address, result);
     return result;
};


export async function getVirtuosoBalance(address)
{
    let virtuosoBalance = 0;
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           if(DEBUG) console.log("getVirtuosoBalance called on chain", chainId, "and address", address);

           if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
                virtuosoBalance = await readVirtuoso.virtuosoBalances( address);
           };
    };

    return virtuosoBalance;

};

export async function isModerator(address)
{
    let moderator = false;
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           if(DEBUG) console.log("isModerator called on chain", chainId, "and address", address);

           if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
                moderator = await readVirtuoso.moderator( address);
           };
    };

    return moderator;

};


export async function getVirtuosoPublicKey(address)
{
    let publicKey = "";
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           if(DEBUG) console.log("getVirtuosoPublicKey called on chain", chainId, "and address", address);

           if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
                publicKey = await readVirtuoso.publicKeys( address);
           };
    };

    return publicKey;

};

export async function getVirtuosoUnlockableContentKey(tokenId, address)
{
    let key = "";
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           if(DEBUG) console.log("getVirtuosoUnlockableContentKey called on chain", chainId, "and address", address);

           if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
                key = await readVirtuoso.getUnlockableContentKey(tokenId, address);
           };
    };

    return key

};

export async function virtuosoSell(tokenId, ipfsHash, operatorAddress, unlockableIPFSHash, address)
{
    if(DEBUG) console.log("virtuosoSell called:", tokenId, ipfsHash, operatorAddress, unlockableIPFSHash, address);

    signer = provider && provider.getSigner();
    let txresult = '';

    if( signer  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           const signerAddress = await signer.getAddress();
           if(DEBUG) console.log("virtuosoSell called on chain", chainId, "and address", address, "signer address", signerAddress);

           if((chainId === REACT_APP_NETWORK_HEXCHAIN_ID) && (address == signerAddress))
           {

                  const balance = await window.ethereum.request(
                          { method: 'eth_getBalance',
                            params: [address],
                          });
                  if(DEBUG) console.log("virtuosoSell balance", balance/1e18);
                  if( balance < MINIMUM_BALANCE )
                  {
                       txresult = await relayFunction('sell', [tokenId, ipfsHash, operatorAddress, unlockableIPFSHash]);
                       await api.txSent(txresult.hash, REACT_APP_CHAIN_ID, txresult.transactionId);
                  }
                  else
                  {
                        const writeVirtuoso = signer && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, signer);
                        if(DEBUG) console.log("virtuosoSell writeVirtuoso", writeVirtuoso);
                        txresult = await writeVirtuoso.sell(tokenId, ipfsHash, operatorAddress, unlockableIPFSHash);
                        await api.txSent(txresult.hash, REACT_APP_CHAIN_ID);
                    };


           } else console.error("virtuosoSell error - wrong chain or address");
    };

    return txresult;

};

export async function waitForHash(txresult)
{
    let resultwait = await txresult.wait(6);
    if(resultwait.confirmations > 5 ) return true
    else return false;
};

export async function virtuosoMint(address, ipfsHash, unlockableIPFSHash, onEscrow)
{
    if(DEBUG) console.log("virtuosoMint called:", address, ipfsHash, unlockableIPFSHash, onEscrow);

    let txresult = '';
    try {
    signer = provider && provider.getSigner();


    if( signer  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           const signerAddress = await signer.getAddress();
           if(DEBUG) console.log("virtuosoMint called on chain", chainId, "and address", address, "signer address", signerAddress);

           if((chainId === REACT_APP_NETWORK_HEXCHAIN_ID) && (address == signerAddress))
           {

                  const balance = await window.ethereum.request(
                          { method: 'eth_getBalance',
                            params: [address],
                          });
                  if(DEBUG) console.log("virtuosoMint balance", balance/1e18);
                  if( balance < MINIMUM_BALANCE )
                  {
                       txresult = await relayFunction('mintItem', [address, ipfsHash, unlockableIPFSHash, onEscrow, ""]);
                       if(DEBUG) console.log("virtuosoMint result", txresult);
                       await api.txSent(txresult.hash, REACT_APP_CHAIN_ID, txresult.transactionId);
                  }
                  else
                  {
                       const writeVirtuoso = signer && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, signer);
                       if(DEBUG) console.log("virtuosoMint writeVirtuoso", writeVirtuoso);
                       txresult = await writeVirtuoso.mintItem(address, ipfsHash, unlockableIPFSHash, onEscrow, "");
                       await api.txSent(txresult.hash, REACT_APP_CHAIN_ID);
                  };
                       // Send tx to server


           } else console.error("virtuosoMint error - wrong chain or address");
    };
    } catch (error) { console.error("virtuosoMint error", error );};
    return txresult;

};

export async function virtuosoRegisterPublicKey(address)
{
    if(DEBUG) console.log("virtuosoRegisterPublicKey called:", address);
    let result = { hash : '', publicKey: ''};

    try {

    signer = provider && provider.getSigner();




    if( signer  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           const signerAddress = await signer.getAddress();
           if(DEBUG) console.log("virtuosoRegisterPublicKey called on chain", chainId, "and address", address, "signer address", signerAddress);

           if((chainId === REACT_APP_NETWORK_HEXCHAIN_ID) && (address == signerAddress))
           {
                const writeVirtuoso = signer && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, signer);
                if(DEBUG) console.log("virtuosoRegisterPublicKey writeVirtuoso", writeVirtuoso);

                //const askForPublicKey = await injectedProvider.send("eth_getEncryptionPublicKey", [ address ]);
                const publicKey = await window.ethereum.request({method: 'eth_getEncryptionPublicKey', params: [address]});
                if( publicKey !== "")
                {
                  result.publicKey = publicKey;
                  const balance = await window.ethereum.request(
                          { method: 'eth_getBalance',
                            params: [address],
                          });
                  if(DEBUG) console.log("virtuosoRegisterPublicKey balance", balance/1e18);
                  if( balance < MINIMUM_BALANCE )
                  {
                       //const relayresult = await submitPublicKey(publicKey);
                       const relayresult = await relayFunction('setPublicKey', [publicKey]);
                       result.hash = relayresult.hash;
                       await api.txSent(relayresult.hash, REACT_APP_CHAIN_ID, relayresult.transactionId);
                  }
                  else
                  {
                        const txresult = await writeVirtuoso.setPublicKey(publicKey);
                        // Send tx to server
                        await api.txSent(txresult.hash, REACT_APP_CHAIN_ID);
                        result.hash = txresult.hash;
                        //txresult.wait(6);
                  }

                };

           } else console.error("virtuosoRegisterPublicKey error - wrong chain or address");
    };

    if(DEBUG) console.log("virtuosoRegisterPublicKey result:", result);

    } catch (error) { console.error("virtuosoRegisterPublicKey error", error );};
    return result;

};

export async function getSignature(message)
{
      let signature = "";

      try {

          signer = provider && provider.getSigner();
          const signerAddress = await signer.getAddress();
          // Directly call the JSON RPC interface, since ethers does not support signTypedDataV4 yet
          // See https://github.com/ethers-io/ethers.js/issues/830
          if(DEBUG) console.log("getSignature:", message, signerAddress);
          signature = await window.ethereum.request({method: 'eth_signTypedData_v4', params: [signerAddress, message]});
          //signer.send('eth_signTypedData_v4', [signerAddress, message]);

        } catch (error) { console.error("getSignature error", error );};

      return signature;
};


export function convertAddress(address)
{
    if( address !== "") return ethers.utils.getAddress(address);
    else return address;

};

export async function metamaskLogin( openlink = true )
{
     let address = "";
     if(DEBUG) console.log("metamaskLogin called: ", window.ethereum); //, " with virtuosoBalance", virtuosoBalance);
     //if(DEBUGM) message.info(`metamaskLogin called ${window.ethereum}`, 60);

     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        await initVirtuoso();
        const account =  await window.ethereum.request({method: 'eth_requestAccounts'});
        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        if(DEBUG) console.log("metamaskLogin account", account, chainId);
        //if(DEBUGM) message.info(`metamaskLogin account ${account} chain ${chainId}`, 60);

        //window.ethereum.on('chainChanged', handleChainChanged);
        //window.ethereum.on('accountsChanged', handleAccountsChanged);
        //const address =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           if( chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
              address = ethers.utils.getAddress(account[0]);
           } else
           {
                if(DEBUGM) message.info(`metamaskLogin switchchain`, 60);
                await switchChain();
                const chainIdNew =  await window.ethereum.request({method: 'eth_chainId'});

                if(DEBUG) console.log("metamaskLogin chain switched ", chainIdNew );
                if( chainIdNew === REACT_APP_NETWORK_HEXCHAIN_ID)
                {
                    initVirtuoso();
                    const account1 =  await window.ethereum.request({method: 'eth_requestAccounts'});
                    if(account1.length > 0)
                    {
                      address = ethers.utils.getAddress(account1[0]);
                      if(DEBUG) console.log("metamaskLogin address after chain switched ", address);
                    };
                };
           };
         } else { if( isMobile ) window.location.reload(true); };

     }
     else
     {
        if( openlink )
        {
              const linkURL = "https://metamask.app.link/dapp/nftvirtuoso.io" + window.location.pathname ;
              window.open(linkURL);
        };
     }

     if(DEBUG) console.log("metamaskLogin: connected with address: ", address );

     return address;
 };


async function switchChain()
{

  if(DEBUG) console.log("switchChain: Switching chain to ", REACT_APP_NETWORK_HEXCHAIN_ID);


     try {
     await window.ethereum.request(
          { method: 'wallet_switchEthereumChain',
            params: [{chainId: REACT_APP_NETWORK_HEXCHAIN_ID}],
          });

     } catch (error) {
           // This error code indicates that the chain has not been added to MetaMask.
           //if (error.code === 4902)
           //{
           //     console.error("switchChain: Switching chain failed with code 4902, trying to add chain", network.name);
              //if(DEBUGM) message.error(`switchChain: Switching chain failed: ${error.code} ${error.message}`, 60);
                try {
                await window.ethereum.request(
                { method: "wallet_addEthereumChain",
                  params:
                      [{
                          chainId: REACT_APP_NETWORK_HEXCHAIN_ID,// A 0x-prefixed hexadecimal string
                          chainName: REACT_APP_NETWORK_NAME,
                          nativeCurrency: {
                            name: REACT_APP_NETWORK_TOKEN,
                            symbol: REACT_APP_NETWORK_TOKEN, // 2-6 characters long
                            decimals: 18
                           },
                           rpcUrls: [REACT_APP_RPCURL_METAMASK],
                           blockExplorerUrls: [REACT_APP_NETWORK_EXPLORER]
                        }]
                  });

                } catch (addError)
                {
                    console.error("switchChain: Adding chain failed:", addError);
                    message.error(`Adding chain failed: ${addError.code} ${addError.message}`, 60);
                }
             /*
             }
             else
             {
                console.error("switchChain: Switching chain failed:", error);
                 if(DEBUGM) message.error(`switchChain: Switching chain failed: ${error.code} ${error.message}`, 60);
             } */

      }
};


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
