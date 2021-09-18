import React from "react";
import {Highlight,} from 'react-instantsearch-dom';
import {Button} from "antd";
import IntlMessages from "util/IntlMessages";
import { getAddress } from "../../blockchain/metamask";

const ProductItem = ({item}) => {
  const icons = [];
  //console.log("Item: ", item);

    var buyTokenPath = "";
    if( item.onSale === true)
    {
          const myaddress = await getAddress();
          buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                     "&tokenID=" + item.tokenId.toString();
    };

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
         <form action={buyTokenPath} method="POST">
          <Button
          type="primary"
          htmlType="submit"
          >
            <IntlMessages id="sidebar.algolia.buy"/>
            </Button>
            </form>
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
