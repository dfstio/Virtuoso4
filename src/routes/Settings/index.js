import React from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button} from "antd";

import IntlMessages from "util/IntlMessages";

const SamplePage = () => {

  const address = useSelector(({blockchain}) => blockchain.address);

  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 1000, "Added $10 ");
  }


  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.settings"/></h2>

      <div className="gx-d-flex justify-content-center">
        <h4>NFT Virtouso settings</h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button type="primary" onClick={add}
        >
        Topup $10
        </Button>
      </div>

    </div>
  );
};

export default SamplePage;
