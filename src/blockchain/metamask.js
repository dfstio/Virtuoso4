import React, {useState} from "react";

// SET TARGET NETWORK


const NETWORKS = require("./constants.js");
const network = NETWORKS.mumbai; // IMPORTANT



//const ethers = require("ethers");
//const MetaMaskOnboarding = require('@metamask/onboarding');
//const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");

//const contractAddress = process.env.CONTRACT_ADDRESS;
//const URL = process.env.URL;
const rpcUrlMetaMask = process.env.RPCURL_METAMASK;


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner();
//const virtuoso = new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
const DEBUG = true;

var address = '';


export function getMetaMaskAddress()
{
    return address;
};

function handleChainChanged(_chainId) {
  if(DEBUG) console.log("handleChainChanged ", _chainId );
  address = "";
  // We recommend reloading the page, unless you must do otherwise

}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('handleAccountsChanged: Please connect to MetaMask.');
  } else if (accounts[0] !== address) {
    address = accounts[0];
    console.log('handleAccountsChanged: new address', address);

    // Do any other work!
  }
}

export async function metamaskLogin()
{

     if(DEBUG) console.log("metamaskLogin called: ", window.ethereum); //, " with virtuosoBalance", virtuosoBalance);
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask == true))
     {
        const account =  await window.ethereum.request({method: 'eth_requestAccounts'});
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        //const address =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           address = account[0];
         }
         else address = "";

     } else address = "";

     if(DEBUG) console.log("metamaskLogin: connected with address: ", address );

     return address;
 };


async function switchChain()
{
  const chainHex = "0x" + network.chainId.toString(16);
  if(DEBUG) console.log("switchChain: Switching chain to ", chainHex);


     try {
     await window.ethereum.request("wallet_switchEthereumChain", [{chainId: chainHex}] );

     } catch (error) {
           // This error code indicates that the chain has not been added to MetaMask.
           if (error.code === 4902)
           {
                console.error("switchChain: Switching chain failed with code 4902, trying to add chain", network.name);

                try {
                await window.ethereum.request("wallet_addEthereumChain",
                      [{
                          chainId: chainHex,// A 0x-prefixed hexadecimal string
                          chainName: network.name,
                          nativeCurrency: {
                            name: network.token,
                            symbol: network.token, // 2-6 characters long
                            decimals: 18
                           },
                           rpcUrls: rpcUrlMetaMask,
                           blockExplorerUrls: [network.blockExplorer]
                        }] );

                } catch (addError)
                {
                    console.erroe("switchChain: Adding chain failed:", addError);
                }
             }
             else
             {
                console.erroe("switchChain: Switching chain failed:", error);
             }

      }
};


