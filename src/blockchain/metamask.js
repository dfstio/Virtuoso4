import api from "../serverless/api";
import {relayFunction} from "../relay/relayclient";
// SET TARGET NETWORK
const {NETWORKS} = require("../constants/Blockchain.js");

export const network = NETWORKS.mumbai; // IMPORTANT
const MINIMUM_BALANCE  = 1e17; // to switch to relay

const ethers = require("ethers");
//const MetaMaskOnboarding = require('@metamask/onboarding');
const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
//const URL = process.env.URL;
const rpcUrlMetaMask = process.env.REACT_APP_RPCURL_METAMASK;
const {REACT_APP_CONTRACT_ADDRESS, REACT_APP_CHAIN_ID, REACT_APP_RPCURL_METAMASK} = process.env;


var provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
var signer = provider && provider.getSigner();
var readVirtuoso = provider && new ethers.Contract(contractAddress, VirtuosoNFTJSON, provider);
const DEBUG = true;




export async function initVirtuoso(handleEvents )
{

        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        if(DEBUG) console.log("initVirtuoso called on chain", chainId);

         if(chainId === network.hexChainId)
         {
           provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
           readVirtuoso = provider && new ethers.Contract(contractAddress, VirtuosoNFTJSON, provider);
           if( readVirtuoso )
           {
              readVirtuoso.removeAllListeners();
              //readVirtuoso.on({}, handleEvents);
              if(DEBUG) console.log("initVirtuoso success on chain", chainId);
           };
         } else console.log("Cannot init virtuoso - wrong chain", chainId, ",needs to be", network.name, network.hexChainId );

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


         if((account.length > 0) && (chainId === network.hexChainId))
         {
           address = ethers.utils.getAddress(account[0]);

         }
     };


     if(DEBUG) console.log("metamask initAccount address: ", address );

     return address;
};

export async function getAddress()
{
    if(DEBUG) console.log("getAddress called");
     let address = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        const account =  await window.ethereum.request({method: 'eth_accounts'});

        if(DEBUG) console.log("getAddress account", account, chainId);


         if((account.length > 0 ) && (chainId === network.hexChainId))
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

           if(chainId === network.hexChainId)
           {
                virtuosoBalance = await readVirtuoso.virtuosoBalances( address);
           };
    };

    return virtuosoBalance;

};



export async function getVirtuosoPublicKey(address)
{
    let publicKey = "";
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           if(DEBUG) console.log("getVirtuosoPublicKey called on chain", chainId, "and address", address);

           if(chainId === network.hexChainId)
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

           if(chainId === network.hexChainId)
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

           if((chainId === network.hexChainId) && (address == signerAddress))
           {

                  const balance = await window.ethereum.request(
                          { method: 'eth_getBalance',
                            params: [address],
                          });
                  if(DEBUG) console.log("virtuosoSell balance", balance/1e18);
                  if( balance < MINIMUM_BALANCE )
                  {
                       txresult = await relayFunction('sell', [tokenId, ipfsHash, operatorAddress, unlockableIPFSHash]);
                       await api.txSent(txresult.hash, network.chainId, txresult.transactionId);
                  }
                  else
                  {
                        const writeVirtuoso = signer && new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
                        if(DEBUG) console.log("virtuosoSell writeVirtuoso", writeVirtuoso);
                        txresult = await writeVirtuoso.sell(tokenId, ipfsHash, operatorAddress, unlockableIPFSHash);
                        await api.txSent(txresult.hash, network.chainId);
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

           if((chainId === network.hexChainId) && (address == signerAddress))
           {

                  const balance = await window.ethereum.request(
                          { method: 'eth_getBalance',
                            params: [address],
                          });
                  if(DEBUG) console.log("virtuosoMint balance", balance/1e18);
                  if( balance < MINIMUM_BALANCE )
                  {
                       txresult = await relayFunction('mintItem', [address, ipfsHash, unlockableIPFSHash, onEscrow]);
                       await api.txSent(txresult.hash, network.chainId, txresult.transactionId);
                  }
                  else
                  {
                       const writeVirtuoso = signer && new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
                       if(DEBUG) console.log("virtuosoMint writeVirtuoso", writeVirtuoso);
                       txresult = await writeVirtuoso.mintItem(address, ipfsHash, unlockableIPFSHash, onEscrow);
                       await api.txSent(txresult.hash, network.chainId);
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

           if((chainId === network.hexChainId) && (address == signerAddress))
           {
                const writeVirtuoso = signer && new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
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
                       await api.txSent(relayresult.hash, network.chainId, relayresult.transactionId);
                  }
                  else
                  {
                        const txresult = await writeVirtuoso.setPublicKey(publicKey);
                        // Send tx to server
                        await api.txSent(txresult.hash, network.chainId);
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

export function getSignature(message)
{
      let signature = "";

      try {

          signer = provider && provider.getSigner();
          const signerAddress = await signer.getAddress();
          // Directly call the JSON RPC interface, since ethers does not support signTypedDataV4 yet
          // See https://github.com/ethers-io/ethers.js/issues/830
          signature = await signer.send('eth_signTypedData_v4', [signerAddress, message]);

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
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        await initVirtuoso();
        const account =  await window.ethereum.request({method: 'eth_requestAccounts'});
        const chainId =  await window.ethereum.request({method: 'eth_chainId'});
        if(DEBUG) console.log("metamaskLogin account", account, chainId);

        //window.ethereum.on('chainChanged', handleChainChanged);
        //window.ethereum.on('accountsChanged', handleAccountsChanged);
        //const address =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           if( chainId === network.hexChainId)
           {
              address = ethers.utils.getAddress(account[0]);
           } else
           {
                await switchChain();
                const chainIdNew =  await window.ethereum.request({method: 'eth_chainId'});

                if(DEBUG) console.log("metamaskLogin chain switched ", chainIdNew );
                if( chainIdNew === network.hexChainId)
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
         };

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
  const chainHex = "0x" + network.chainId.toString(16);
  if(DEBUG) console.log("switchChain: Switching chain to ", chainHex);


     try {
     await window.ethereum.request(
          { method: 'wallet_switchEthereumChain',
            params: [{chainId: chainHex}],
          });

     } catch (error) {
           // This error code indicates that the chain has not been added to MetaMask.
           if (error.code === 4902)
           {
                console.error("switchChain: Switching chain failed with code 4902, trying to add chain", network.name);

                try {
                await window.ethereum.request(
                { method: "wallet_addEthereumChain",
                  params:
                      [{
                          chainId: chainHex,// A 0x-prefixed hexadecimal string
                          chainName: network.name,
                          nativeCurrency: {
                            name: network.token,
                            symbol: network.token, // 2-6 characters long
                            decimals: 18
                           },
                           rpcUrls: [rpcUrlMetaMask],
                           blockExplorerUrls: [network.blockExplorer]
                        }]
                  });

                } catch (addError)
                {
                    console.error("switchChain: Adding chain failed:", addError);
                }
             }
             else
             {
                console.error("switchChain: Switching chain failed:", error);
             }

      }
};


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
