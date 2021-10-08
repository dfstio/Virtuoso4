import React from "react";
import { useParams } from "react-router-dom";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button} from "antd";

import IntlMessages from "util/IntlMessages";

const Token = ({match}) => {

  const address = useSelector(({blockchain}) => blockchain.address);
  const {id} = useParams();
  console.log("id", match, match.params, match.params.chainId, match.params.contract, match.params.tokenId);

  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 1000, "Added $10 ");
  }


  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.settings"/></h2>

      <div className="gx-d-flex justify-content-center">
        <h4>NFT Virtouso settings {match.params.chainId} {match.params.contract} {match.params.tokenId}</h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button type="primary" onClick={add}
        >
        Token
        </Button>
      </div>

    </div>
  );
};

export default Token;
