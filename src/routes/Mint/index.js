import React from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button} from "antd";

import IntlMessages from "util/IntlMessages";

const Mint = () => {

  const address = useSelector(({blockchain}) => blockchain.address);

  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 100, "Added $1 ");
  }


  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.samplePage"/></h2>

      <div className="gx-d-flex justify-content-center">
        <h4>NFT Virtouso sample page</h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button type="primary" onClick={add}
        >
        Add balance
        </Button>
      </div>

    </div>
  );
};

export default Mint;
