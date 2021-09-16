const ethers = require("ethers");
const MetaMaskOnboarding = require('@metamask/onboarding');
const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");
const network = require("./constants.js");
const contractAddress = process.env.CONTRACT_ADDRESS;
const URL = process.env.URL;
const rpcUrlMetaMask = process.env.RPCURL_METAMASK;


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const virtuoso = new ethers.Contract(contractAddress, VirtuosoNFTJSON, signer);
const DEBUG = true;


async function metamaskLogin()
{

    if( !MetaMaskOnboarding.isMetaMaskInstalled())
    {
        // Install MetaMask
        MetaMaskOnboarding.startOnboarding();
    }
    else // check for chainId
    {
          const chainId = await signer.getChainId();

          if((provider !== undefined) && (network.chainId !== chainId) )
          {
              switchChain();
          };

         const account =  await provider.send("eth_accounts");
         const virtuosoBalance = await virtuoso.virtuosoBalances(address);
         if(DEBUG) console.log("metamaskLogin: connected to account ", account, " with virtuosoBalance", virtuosoBalance);

    };



};


async function switchChain()
{
  const chainHex = "0x" + network.chainId.toString(16);
  if(DEBUG) console.log("switchChain: Switching chain to ", chainHex);


     try {
     await provider.send("wallet_switchEthereumChain", [{chainId: chainHex}] );

     } catch (error) {
           // This error code indicates that the chain has not been added to MetaMask.
           if (error.code === 4902) {
           console.error("switchChain: Switching chain failed with code 4902, trying to add chain", network.name);

             try {
               await provider.send("wallet_addEthereumChain",
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

              } catch (addError) {
               console.erroe("switchChain: Adding chain failed:", addError);
             } else
             {
                console.erroe("switchChain: Switching chain failed:", error);
             }

           }
           // handle other "switch" errors

      }
};



export default {
  metamaskLogin: metamaskLogin
}
