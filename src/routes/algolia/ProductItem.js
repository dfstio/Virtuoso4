import React from "react";
import {Highlight,} from 'react-instantsearch-dom';
import {Button} from "antd";
import IntlMessages from "util/IntlMessages";
import { metamaskLogin } from "../../blockchain/metamask";
const DEBUG = true;

const ProductItem = ({item}) => {
  //const icons = [];
  //console.log("Item: ", item);


  return (
    <div className="gx-product-item gx-product-vertical" >
      <div className="gx-product-image">
        <img
          src={`https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/${
            item.image
            }`} alt=''
        />
      </div>
      <div className="gx-product-body" >

        <div className="gx-product-name">
        <span>
          <Highlight attribute="name" hit={item}/>
        </span>
        {item.onSale?(
        <span style={{ float: "right"}}>
          <Button
          type="primary"
          onClick={ async () => {
                    if(DEBUG) console.log("Buy clicked");
                    const myaddress = await metamaskLogin();
                    let buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                     "&tokenID=" + item.tokenId.toString();
                    if( myaddress !== "")
                    {
                        buyTokenPath = "/api/create-checkout-session?type=buy&address=" + myaddress +
                          "&tokenID=" + item.tokenId.toString();
                    };

                    let form = document.createElement('form');
                    form.action = buyTokenPath;
                    form.method = 'POST';

                    // the form must be in the document to submit it
                    document.body.append(form);

                    form.submit();

                }}

          >
            <IntlMessages id="sidebar.algolia.buy"/>
            </Button>
        </span>
        ):("")}
        </div>
        <div className="gx-mb-3">
          <Highlight attribute="category" hit={item}/>
        </div>


        {item.onSale?(
        <div className="gx-product-price"  >
           <span >
            Token VRT1-{item.tokenId}
             </span>
         <span style={{ float: "right"}}>
          {item.currency} {item.price}
           </span>

          </div>

        ):(
            <div className="gx-product-price">
            Token VRT1-{item.tokenId}
            </div>
          )
        }
        <div className="gx-mt-4">
          <Highlight attribute="shortdescription" hit={item}/>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
