import React from "react";
import {Highlight,} from 'react-instantsearch-dom';
import {Button} from "antd";
import IntlMessages from "util/IntlMessages";

const ProductItem = ({item}) => {
  const icons = [];
  //console.log("Item: ", item);
  for (let i = 0; i < 5; i++) {
    const suffixClassName = i >= item.rating ? '--empty' : '';
    const suffixXlink = i >= item.rating ? 'Empty' : '';
    var buyTokenPath = "";
    if( item.onSale == true)
    {
          buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                     "&tokenID=" + item.tokenId.toString();
    };


    icons.push(
      <svg
        key={i}
        className={`ais-RatingMenu-starIcon ais-RatingMenu-starIcon${suffixClassName}`}
        aria-hidden="true"
        width="24"
        height="24"
      >
        <use xlinkHref={`#ais-RatingMenu-star${suffixXlink}Symbol`}/>
      </svg>
    );
  }
  return (
    <div className="gx-product-item gx-product-vertical" >
      <div className="gx-product-image">
        <img
          src={`https://res.cloudinary.com/hilnmyskv/image/fetch/h_300,q_100,f_auto/${
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
