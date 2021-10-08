import React from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button} from "antd";

import IntlMessages from "util/IntlMessages";
import ProductItem from '../algolia/ProductItem';
import algoliasearch from 'algoliasearch';
const {REACT_APP_ALGOLIA_KEY, REACT_APP_ALGOLIA_PROJECT} = process.env;
const searchClient = algoliasearch(REACT_APP_ALGOLIA_PROJECT, REACT_APP_ALGOLIA_KEY);
const searchIndex = searchClient.initIndex('virtuoso');
const DEBUG = true;

const Token = async ({match}) => {

  //let item = "";
  const address = useSelector(({blockchain}) => blockchain.address);
  //if(DEBUG) console.log("Token match", match.params.chainId.toString(), match.params.contract, match.params.tokenId);

  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 1000, "Added $10 ");
  }

   //const objectID = match.params.chainId.toString() + '.' + match.params.contract.toLowerCase() + '.' + match.params.tokenId.toString();
   //if(DEBUG) console.log("Token objectID", objectID);
   //item = await searchIndex.getObject(objectID);
   //if(DEBUG) console.log("Token item", item);
          //setItem(newItem);



  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.settings"/></h2>

      <div className="gx-d-flex justify-content-center">
        <h4>NFT Virtouso settings </h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button type="primary" onClick={add}
        >
        Token
        </Button>
      </div>
      {/*}
      <div className="gx-d-flex justify-content-center">
      {(true)? (
              <Button type="primary" onClick={add}
        >
        Token 2
        </Button>
      ):(
      <ProductItem
              item={item}
              key={item.objectID}

              />)
      }
       </div> */}
    </div>
  );
};

export default Token;
