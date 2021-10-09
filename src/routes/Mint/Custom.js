import React, {useState} from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button, Row, Col} from "antd";
import TokenItem from '../token/Token';

import IntlMessages from "util/IntlMessages";

const startToken =
{
  "contract": "0x49368c4ed51be6484705f07b63ebd92270923081",
  "chainId": 80001,
  "tokenId": 17,
  "vrtTokenId": "VRT1-17",
  "updated": 1633284972170,
  "owner": "0xa73CC65aBfb96FD65D6EF407535CFDeBBF77fCbb",
  "name": "Последний герой",
  "description": "Tribute группе Кино",
  "shortdescription": "Tribute группе Кино",
  "saleID": 19,
  "onSale": false,
  "saleStatus": "on sale",
  "price": 101,
  "currency": "USD",
  "category": "Music",
  "image": "https://ipfs.io/ipfs/QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS",
  "uri": {
    "name": "Последний герой",
    "type": "object",
    "image": "https://ipfs.io/ipfs/QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS",
    "external_url": "nftvirtuoso.io",
    "animation_url": "https://arweave.net/QQbPpRqmSZorvVsjEW-JF7p2n83i50sdI-fdBRixHwQ",
    "description": "Tribute группе Кино",
    "license": "NFT Virtuoso Personal License Agreement V1",
    "license_id": "0",
    "license_url": "https://arweave.net/wCPAjAJISEeHgrFCkX1xKML1ZF9A4pKT0ij0SmrQyJU",
    "contains_unlockable_content": true,
    "unlockable_content_encryption": {
      "unlockableContentKey": "MetaMask.eth-sig-util.encrypt.x25519-xsalsa20-poly1305",
      "unlockableContent": "crypto-js.AES.encrypt"
    },
    "properties": {
      "image": {
        "MD5_Hash": "7da8efd95a38f088938e80f38f90087f",
        "SHA256_Hash": "4728c12a728609ca32d328fd44ac73bfb59587f27b8486e53eee4efdbca66dc7",
        "IPFShash": "QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS",
        "URL": "https://ipfs.io/ipfs/QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS",
        "filename": "lasthero.png",
        "filetype": "image/png",
        "lastModified": 1631695253436,
        "size": 909890
      },
      "animation": ""
    },
    "attributes": [
      {
        "trait_type": "Artist",
        "value": ""
      }
    ]
  },
  "sale": {
    "price": 101,
    "type": "fixedprice",
    "currency": "usd",
    "comment": "test",
    "contains_unlockable_content": true,
    "operator": {
      "address": "0xf640988326232A441540e4f01643318131aa5c02",
      "time": 1632691467099
    }
  },
  "objectID": "80001.0x49368c4ed51be6484705f07b63ebd92270923081.17"
};

const Mint = () => {

  const address = useSelector(({blockchain}) => blockchain.address);
  const [token, setToken] = useState(startToken);

  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 100, "Added $1 ");
  }


  return (
    <div className="gx-main-content">
      <Row>
        <Col xxl={18} xl={18} lg={18} md={12} sm={24} xs={24}>
          Form
        </Col>
        <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
            <TokenItem
              item={startToken}
              small={true}
              preview={true}
              key="MintSmallToken"

              />
        </Col>
        <Col xxl={12}  xl={12} lg={12} md={12} sm={24} xs={24}>
         <TokenItem
              item={startToken}
              key="MintBigToken"
              preview={true}

              />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
         <TokenItem
              item={startToken}
              key="MintBigToken"
              preview={true}

              />
        </Col>

      </Row>
    </div>
  );
};

export default Mint;
