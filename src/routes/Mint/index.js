import React, {useState} from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button, Row, Col} from "antd";
import MintMenuItem from './MintMenu';

import IntlMessages from "util/IntlMessages";

const Mint = () => {

  const address = useSelector(({blockchain}) => blockchain.address);


  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 100, "Added $1 ");
  }


  return (
    <div className="gx-main-content">
      <Row>
      <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Your Private Token"
              title="Create your own private NFT token"
              price="USD 10 for 10 private NFT tokens"
              description="Private NFT token will be visible only to you on NFT Virtuoso, except when you'll put it for sale"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://nftvirtuoso.io/mintimages/private.png"
              key="Private Mint"

              />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Your Public NFT token"
              title="Create your own public NFT token"
              price="USD 100"
              description="Public NFT token is visible to everyone on NFT Virtuoso"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://nftvirtuoso.io/mintimages/public.jpg"
              key="Public Mint"

              />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="DJ Korean"
              title="DJ Korean Последний герой"
              price="USD 100"
              description="Последний герой - описание"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://ipfs.io/ipfs/QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS"
              key="DJ Korean"

              />
        </Col>
        <Col xxl={12}  xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="DJ Korean"
              title="DJ Korean Push The Button"
              price="USD 100"
              description="Push The Button - описание"
              image= "https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://ipfs.io/ipfs/QmdLdqRJZ2T4bdPJhZBkXGgovgqXe6z58xwCTqdUygeQxi"
              key="DJ Korean 2"

              />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Dokar Japanese Taping"
              title="Taping Video and Instruction"
              price="USD 50"
              description="Резистентное тейпирование морщин в области глаз (гусиные лапки)"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://nftvirtuoso.io/mintimages/dokar.jpg"
              key="Doctor Mint"

              />
        </Col>
                <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Artist L"
              title="Глубина NFT"
              price="USD 5000"
              description="Описание картины глубина NFT"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://nftvirtuoso.io/mintimages/deepnft.jpg"

              key="Artist L Mint"

              />
        </Col>

      </Row>
    </div>
  );
};

export default Mint;
