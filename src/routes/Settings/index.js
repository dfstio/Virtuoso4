import React from "react";
import api from "../../serverless/api";
import {isMobile, isDesktop, isChrome} from 'react-device-detect';
//import {submitPublicKey from "../../relay/relayclient";

import {Button, message} from "antd";


import {useDispatch, useSelector} from "react-redux";
import {updateAddress, updateVirtuosoBalance, updatePublicKey} from "../../appRedux/actions";
import { metamaskLogin,
         virtuosoRegisterPublicKey
         } from "../../blockchain/metamask";

import IntlMessages from "util/IntlMessages";

const DEBUG = true;

const Settings = () => {

  const address = useSelector(({blockchain}) => blockchain.address);
  const publicKey = useSelector(({blockchain}) => blockchain.publicKey);
  const balance = useSelector(({blockchain}) => blockchain.balance);
  const virtuosoBalance = useSelector(({blockchain}) => blockchain.virtuosoBalance);
  const dispatch = useDispatch();

  if(DEBUG) console.log("Settings", address, publicKey, balance, virtuosoBalance);
  let vb = "$0";
  if( virtuosoBalance !== undefined)
  {
    const vb1 = virtuosoBalance/100;
    vb = ' $' + vb1.toString();
  };

  let pb = " is not registered";
  if( publicKey !== undefined && publicKey !== "") pb = " is " + publicKey;

  function add()
  {

            if(DEBUG) console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 1000, "Added $10 ");
  }

  async function register()
  {

            if(DEBUG) console.log("Register clicked", address);
            if( address !== undefined && address !== "")
            {
                 const key = 'RegisterPublicKey';
                 message.loading({content: `Please provide public key in Metamask and confirm transaction`, key, duration: 60});



                const result = await virtuosoRegisterPublicKey(address);
                if( result.publicKey !== "" && result.hash !== "")
                {
                    dispatch(updatePublicKey(result.publicKey));
                    message.success({content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`, key, duration: 10});
                }
                else message.error({content: `Public key is not provided or written to blockchain`, key, duration: 10});

            };
  }



  async function connect()
  {

            if(DEBUG) console.log("Connect clicked", address);
            const newAddress = await metamaskLogin();
            dispatch(updateAddress(newAddress));
            //if( address !== "") api.add( address, 1000, "Added $10 ");
  }

  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.settings"/></h2>

      {address===""?
      (
      <div className="gx-d-flex justify-content-center">
        <Button
        type="primary"
        onClick={connect}
        key="connect"
        >
        Connect with Metamask
        </Button>
      </div>
      )
      :
      (
      <div>
      <div className="gx-d-flex justify-content-center">
        <h4>Your Virtuoso balance: {vb}</h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button
        type="primary"
        onClick={add}
        key = "topup"
        >
        Topup $10
        </Button>
      </div>
      <div className="gx-d-flex justify-content-center">
        <h4>Your Public Key {pb}</h4>
      </div>
      {(isChrome && isDesktop && (address!==""))?(
        <div className="gx-d-flex justify-content-center">
        <Button
        type="primary"
        onClick={register}
        key="register"
        >
        Register public key
        </Button>
      </div>):("")}

      </div>
      )}

    </div>
  );
};

export default Settings;
