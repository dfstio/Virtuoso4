import React, { useEffect, useCallback } from "react";
import {useDispatch, useSelector} from "react-redux";
import {updateAddress, updateVirtuosoBalance} from "../appRedux/actions";
import { metamaskLogin, initAccount, network, getVirtuosoBalance, convertAddress } from "./metamask";


const DEBUG = true;


const MetaMaskAccount = () => {


  const address = useSelector(({blockchain}) => blockchain.address);
  const virtuosoBalance  = useSelector(({blockchain}) => blockchain.virtuosoBalance);
  const dispatch = useDispatch();

  let metamaskText = "CONNECT WITH METAMASK";
  let topupText = "";
  let topup = "";
  let blockExplorer = "";



async function handleEvents(params){
  if(DEBUG) console.log("handleEvents ", address, params.event, params.eventSignature, params.args);
  switch( params.event )
  {
        case 'Balance':
            const adr = convertAddress(params.args[0]);
            if(DEBUG) console.log("handleEvents Balance ", adr, "my address", address);
           if( adr === address)
           {
               const newVirtuosoBalance = await getVirtuosoBalance(address);
               if(DEBUG) console.log("handleEvents my Balance", virtuosoBalance, "changed by ", params.args[1], "to", newVirtuosoBalance, " for", params.args[2]);

               dispatch(updateVirtuosoBalance(newVirtuosoBalance));

           };
           break;
        case "OnMint":
          break;
        case "OnSale":
          break;
        case "Transfer":
          break;
        default:
            if(DEBUG) console.log("handleEvents unexpected event", params.event, params.eventSignature, params.args);
  };
};

async function  handleChainChanged(_chainId){
  if(DEBUG) console.log("handleChainChanged ", _chainId );
  dispatch(updateAddress(""));
  // We recommend reloading the page, unless you must do otherwise

};

async function handleAccountsChanged(accounts){
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('handleAccountsChanged: Please connect to MetaMask.');
    dispatch(updateAddress(""));
  } else
  {
    const newAddress = convertAddress(accounts[0]);
    if ( newAddress!== address)
    {
         dispatch(updateAddress(newAddress));
         const newVirtuosoBalance = await getVirtuosoBalance(newAddress);
         dispatch(updateVirtuosoBalance(newVirtuosoBalance));
         console.log('handleAccountsChanged: new address and balance', newAddress, newVirtuosoBalance);
    }
    // Do any other work!
  }
};

  useEffect(async() => {

              const newAddress = await initAccount(handleEvents, handleChainChanged, handleAccountsChanged );
              dispatch(updateAddress(newAddress));
              const newVirtuosoBalance = await getVirtuosoBalance(newAddress);
              dispatch(updateVirtuosoBalance(newVirtuosoBalance));
              if(DEBUG) console.log(`useEffect Address ${newAddress} virtuosoBalance ${newVirtuosoBalance}`);

  },[])


  if(DEBUG) console.log(`Address ${address} ${virtuosoBalance/100}`);

  let result = (
            <ul className="gx-login-list">
              <li
               onClick={ async () => {
                    if(DEBUG) console.log("Connect to MetaMask clicked");
                    const newAddress = await metamaskLogin();
                    dispatch(updateAddress(newAddress));
                }}
              >
              {metamaskText}
              </li>
              </ul>
  );

  if((address !== undefined) && (address !== ""))
  {
    metamaskText = address.slice(0,6)+"..."+address.slice(38,42);
    if( virtuosoBalance !== undefined)
    {
      const vb = virtuosoBalance/100;
      topupText = "$" + vb.toFixed(2);
      topup = "/api/create-checkout-session?type=mint&address=" + address.toString();
    };
    blockExplorer = network.blockExplorer + "address/" + address;
    result =
    (
            <ul className="gx-login-list">
              <li
               onClick={ async () => {
                    window.open(blockExplorer);
                }}
              >
              {metamaskText}
              </li>
              <li
               onClick={() => {
                    console.log("Topup clicked", topup);
                    if( topup !== "")
                    {
                         let form = document.createElement('form');
                         form.action = topup;
                         form.method = 'POST';

                         // the form must be in the document to submit it
                         document.body.append(form);

                         form.submit();
                    };
                }}

              >
              {topupText}
              </li>
            </ul>

    );
   };




    return result;
    /*

            }
      ); */
};

export default MetaMaskAccount;
