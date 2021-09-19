// SET TARGET NETWORK
const {NETWORKS} = require("../constants/Blockchain.js");
export const network = NETWORKS.mumbai; // IMPORTANT

const ethers = require("ethers");
//const MetaMaskOnboarding = require('@metamask/onboarding');
const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const URL = process.env.URL;
const rpcUrlMetaMask = process.env.REACT_APP_RPCURL_METAMASK;


const provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
const signer = provider && provider.getSigner();
const readVirtuoso = provider && new ethers.Contract(contractAddress, VirtuosoNFTJSON, provider);
const DEBUG = false;




export async function initAccount(handleEvents, handleChainChanged, handleAccountsChanged )
{

     let address = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        if( readVirtuoso ) readVirtuoso.on({}, handleEvents);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        const account =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           address = ethers.utils.getAddress(account[0]);

         }
     };

     if(DEBUG) console.log("metamask initAccount address: ", address );

     return address;
};

export async function getAddress()
{

     let address = "";
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        const account =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           address = ethers.utils.getAddress(account[0]);

         }
     };

     return address;
};



export async function getVirtuosoBalance(address)
{
    let virtuosoBalance = 0;
    if( readVirtuoso  && (address !== "")) virtuosoBalance = await readVirtuoso.virtuosoBalances( address);
    return virtuosoBalance;

};

export function convertAddress(address)
{
    if( address !== "") return ethers.utils.getAddress(address);
    else return address;

};

export async function metamaskLogin()
{
     let address = "";
     if(DEBUG) console.log("metamaskLogin called: ", window.ethereum); //, " with virtuosoBalance", virtuosoBalance);
     if( (window.ethereum !== undefined) && (window.ethereum.isMetaMask === true))
     {
        const account =  await window.ethereum.request({method: 'eth_requestAccounts'});
        //window.ethereum.on('chainChanged', handleChainChanged);
        //window.ethereum.on('accountsChanged', handleAccountsChanged);
        //const address =  await window.ethereum.request({method: 'eth_accounts'});

         if(account.length > 0)
         {
           address = ethers.utils.getAddress(account[0]);
         };

     };

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


