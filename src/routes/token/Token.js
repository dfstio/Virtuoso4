import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {message} from 'antd';
import {updateAddress, updateVirtuosoBalance, updatePublicKey} from "../../appRedux/actions";
import {Button} from "antd";
import IntlMessages from "util/IntlMessages";
import { metamaskLogin, virtuosoRegisterPublicKey, getVirtuosoUnlockableContentKey, metamaskDecrypt } from "../../blockchain/metamask";
import  SellButton  from "../algolia/Sell";
import ReactPlayer from 'react-player';
const { getFromIPFS, decryptUnlockableToken } = require("../../blockchain/ipfs");


const DEBUG = true;
const content = {
          "unlockable_description": "",
          "image": "",
          "video": "",
          "audio": "",
          "pdf": "",
          "files": "",
          "files_number": 0,
          "loaded": false
      };

const TokenItem = ({item, small=false, preview=false}) => {
  //const icons = [];
  //if(DEBUG) console.log("Item: ", item, small, preview);
  const address = useSelector(({blockchain}) => blockchain.address);
  const publicKey = useSelector(({blockchain}) => blockchain.publicKey);
  const dispatch = useDispatch();
  const [unlockable, setUnlockable] = useState(content);
  const [loadingUnlockable, setLoadingUnlockable] = useState(false);


  let buttonId = "sidebar.algolia.buy";
  let canSell = false;
  if( address.toUpperCase() === item.owner.toUpperCase())
  {
      buttonId = "sidebar.algolia.sell";
      canSell = true;
  }

  async function register()
  {

            if(DEBUG) console.log("Register clicked", address);
            if( address !== undefined && address !== "")
            {
                 const key = 'RegisterPublicKeyTokenItem';
                 message.loading({content: `To view unlockable content please provide public key in Metamask and confirm transaction`, key, duration: 60});

                const result = await virtuosoRegisterPublicKey(address);
                if( result.publicKey !== "" && result.hash !== "")
                {
                    dispatch(updatePublicKey(result.publicKey));
                    message.success({content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`, key, duration: 30});
                    return publicKey;
                }
                else message.error({content: `Public key is not provided or written to blockchain`, key, duration: 10});

            };
            return "";
  }

  const loadUnlockable = async () => {

         const key = 'loadUnlockable';
         setLoadingUnlockable(true);
         message.loading({content: `Loading unlockable content from blockchain`, key, duration: 240});


         try {
              const encryptedKey = await getVirtuosoUnlockableContentKey(item.tokenId, address);
              if(DEBUG)  console.log("View - unlockable key: ", encryptedKey);

              if( encryptedKey !== "")
              {
                  const unlockableIPFS = await getFromIPFS(encryptedKey);
                  //if(DEBUG)  console.log("unlockable unlockableIPFS: ", unlockableIPFS );
                  let unlockableJSON = JSON.parse(unlockableIPFS.toString());
                  const password = await metamaskDecrypt( unlockableJSON.key, address );
                  const decryptedData = await decryptUnlockableToken(unlockableJSON.data, password);

                  setUnlockable(decryptedData);
                  if(DEBUG)  console.log("View - Decrypted data: ", decryptedData);
                  message.success({content: `Unlockable content loaded`, key, duration: 30});


              } else message.error({content: `Error loading unlockable content`, key, duration: 30});

         } catch(error)
         {
            console.error("loadUnlockable error:", error);
            message.error({content: `Error loading unlockable content`, key, duration: 30});
         }

         setLoadingUnlockable(false);
};


  async function showUnlockableContent()
  {
        if(DEBUG) console.log("showUnlockableContent", publicKey, address)
        if( address !== undefined && address !== "")
        {
            if( publicKey === undefined || publicKey === "" || publicKey === 'a' )
            {
                if(DEBUG) console.log("showUnlockableContent wrong public key" , publicKey);
                await register();
            }
            else
            {
                await loadUnlockable();
            }


        } else message.error("Please connect with MetaMask")
  }



  return (
    <div className="gx-product-item gx-product-vertical" >
    {(small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === true)?
    (
        <div className="gx-product-body" >
             <div className="gx-mt-4">
              {unlockable.unlockable_description}
              </div>

            <div className="gx-product-image" style={{position: "relative"}}>
            {(unlockable.image !== "")?(<span> <img src={unlockable.image} /> </span>):("")}
            {(unlockable.video !== "")?(
             <span>
                    <ReactPlayer
                    url={unlockable.video}
                    controls={true}
                    //light={true}
                    width='100%'
                    height='100%'
                    />
            </span>):("")}
           {(unlockable.audio !== "")?(
             <span>
                    <ReactPlayer
                    url={unlockable.audio}
                    controls={true}
                    //light={true}
                    width='100%'
                    height='100%'
                    />
            </span>):("")}
            {(unlockable.files !== "")?(
             <span>
                    {unlockable.files}
            </span>):("")}
            </div>
        </div>
     )
     :
     (
       ""
     )}

    {(small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === false)?
    (
        <div className="gx-product-body" >
                <Button
                 onClick={showUnlockableContent}
                 >
                 Show Unlockable Content
                 </Button>

        </div>
     )
     :
     (
       ""
     )}
      <div className="gx-product-image" style={{position: "relative"}}>
      <span>
            <img
             src={`https://res.cloudinary.com/virtuoso/image/fetch/q_100,f_auto/${
               item.image
               }`} alt=''
           />
      </span>
      <span>
       {(small==false && item.uri.animation_url !== undefined && item.uri.animation_url !== "")?
           (
              <ReactPlayer
              url={item.uri.animation_url}
              controls={true}
              //light={true}
              width='100%'
              height='100%'
              />
            )
            :
            (
              ""
            )}
      </span>
      </div>
      <div className="gx-product-body" >

        <div className="gx-product-name">
        <span style={{"font-size":22, "color":"#038fde"}}>
          {item.name}
        </span>
        {canSell?(
        <span style={{ float: "right"}}>
        <SellButton
        item = {item}
        address = {address}
        />
        </span>
        )
        :
        (
        <span>
        {item.onSale?(
        <span style={{ float: "right"}}>
          <Button
          type="primary"
          onClick={ async () => {
                    if(DEBUG) console.log("Buy clicked");

                    message.loading("Preparing checkout page", 10);
                    const myaddress = await metamaskLogin(false);
                    dispatch(updateAddress(myaddress));

                    if( myaddress !== item.owner)
                    {
                           let buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                            "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();
                           if( myaddress !== "")
                           {
                               buyTokenPath = "/api/create-checkout-session?type=buy&address=" + myaddress +
                                 "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();;
                           };

                           let form = document.createElement('form');

                           form.action = buyTokenPath;
                           form.method = 'POST';

                           // the form must be in the document to submit it
                           document.body.append(form);

                           form.submit();
                    }
                    else
                    {
                          message.error("You already own this NFT token", 10);
                    };

                }}

          >
            <IntlMessages id={buttonId}/>
            </Button>
        </span>
        ):("")}
         </span>
        )}
        </div>
        <div className="gx-mb-3">
          {item.category}
        </div>


        {item.onSale?(
        <div className="gx-product-price"  >
           <span >
            Token {item.vrtTokenId}
             </span>
         <span style={{ float: "right"}}>
          {item.currency} {item.price}
           </span>

          </div>

        ):(
            <div className="gx-product-price">
            Token {item.vrtTokenId}
            </div>
          )
        }
        <div className="gx-mt-4">
         {item.description}
        </div>
      </div>
    </div>
  );
};

export default TokenItem;
