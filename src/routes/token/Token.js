import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {message} from 'antd';
import {updateAddress, updateVirtuosoBalance} from "../../appRedux/actions";
import {Button} from "antd";
import IntlMessages from "util/IntlMessages";
import { metamaskLogin } from "../../blockchain/metamask";
import  SellButton  from "../algolia/Sell";
import ReactPlayer from 'react-player';
const DEBUG = true;

const TokenItem = ({item, small=false, preview=false}) => {
  //const icons = [];
  //console.log("Item: ", item);
  const address = useSelector(({blockchain}) => blockchain.address);
  const dispatch = useDispatch();
  let buttonId = "sidebar.algolia.buy";
  let canSell = false;
  if( address.toUpperCase() === item.owner.toUpperCase())
  {
      buttonId = "sidebar.algolia.sell";
      canSell = true;
  }


  return (
    <div className="gx-product-item gx-product-vertical" >
      <div className="gx-product-image" style={{position: "relative"}}>
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
               <img
                 src={`https://res.cloudinary.com/virtuoso/image/fetch/h_500,q_100,f_auto/${
                   item.image
                   }`} alt=''
               />
            )}
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
