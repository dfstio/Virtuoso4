import React, {useState} from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button, Row, Col, Form, Input, Radio, Card, Upload, Switch, Select } from "antd";
import TokenItem from '../token/Token';
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {message} from 'antd';
import IntlMessages from "util/IntlMessages";

const { addFileToIPFS } = require("../../blockchain/ipfs");
const { TextArea } = Input;
const { Option } = Select;




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
  "image": "",
  "contains_unlockable_content": false,
  "unlockable_description": "",
  "uri": {
    "name": "Последний герой",
    "type": "object",
    "image": "https://ipfs.io/ipfs/QmQAGbHxf9q1p1ocsp12LKtwMV8msYGW6N4A9yiGSovuiS",
    "external_url": "nftvirtuoso.io",
    "animation_url": "",
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

const STARTING_JSON = {
"name": "My NFT",
"type": "object",
"image": "",
"category": "",
"visibility": "private",
"external_url":"nftvirtuoso.io",
"animation_url":"",
"description": "",
"license": "NFT Virtuoso V1 personal",
"license_id": "0",
"title": "",
"properties": { "image": "", "animation": ""},
"unlockable_description": "",
"contains_unlockable_content": false,
"unlockable": {
    "image": "",
    "video": "",
    "audio": "",
    "pdf": "",
    "files": "",
    "files_number": 0
  }
};


const DEBUG = true;

const MintPrivate = () => {

  const address = useSelector(({blockchain}) => blockchain.address);
  const [token, setToken] = useState(startToken);
  const [counter, setCounter] = useState(0);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [showUnlockable, setShowUnlockable] = useState(false);
  const [form] = Form.useForm();

  const onValuesChange = async (values) => {

    if(DEBUG) console.log("onValuesChange 1", values);
    let newToken = token;
    //if( values.title !== undefined) token.name = values.title;
    if( values.name !== undefined) newToken.name = values.name;
    if( values.description !== undefined) newToken.description = values.description;
    if( values.category !== undefined) newToken.category = values.category;
    if( values.contains_unlockable_content !== undefined)
    {
        setShowUnlockable(values.contains_unlockable_content);
        newToken.contains_unlockable_content = values.contains_unlockable_content;
    };

    setToken(newToken);
    if(DEBUG) console.log("onValuesChange 2", token.name);
    setCounter(counter+1);


  };

  const onFinish = async (values) => {

    if(DEBUG) console.log("onFinish", values);

  };


    const categoryChange = (value) => {

    if(DEBUG) console.log("categoryChange", value);
    let newToken = token;
    newToken.category = value;
    setToken(newToken);
    setCounter(counter+1);

  };

    const beforeUploadImage = async (file) => {

        if(DEBUG) console.log("beforeUploadImage ", file);
        setLoadingImage(true);
        let newToken = token;
        const key = 'IPFSimageloading';
        message.loading({content: `Uploading ${file.name} to IPFS`, key});

        const hash = await addFileToIPFS(file);
        if(DEBUG) console.log("Image File added to IPFS: ", hash.path);
        const url = `https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://ipfs.io/ipfs/${hash.path}`;

        newToken.image = url;
        message.success({content: `File ${file.name} uploaded to https://ipfs.io/ipfs/${hash.path}`, key, duration: 5});
        setToken(newToken);
        setLoadingImage(false);
        return false;
  };

    const beforeUploadVideo = async (file) => {
        if(DEBUG) console.log("beforeUploadVideo ", file);
        setLoadingVideo(true);
        let newToken = token;
        const key = 'IPFSvideoloading';
        message.loading({content: `Uploading ${file.name} to IPFS`, key, duration: 60});
        const hash = await addFileToIPFS(file);
        if(DEBUG) console.log("Video File added to IPFS: ", hash.path);
        const url = `https://ipfs.io/ipfs/${hash.path}`;

        newToken.uri.animation_url = url;
        message.success({content: `File ${file.name} uploaded to https://ipfs.io/ipfs/${hash.path}`, key, duration: 5});
        setToken(newToken);
        setLoadingVideo(false);
        return false;
  };

  return (
    <div className="gx-main-content">
      <Row>
        <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
      <Card className="gx-card" title="Create Private NFT">
      <Form
        form={form}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        initialValues={token}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
      >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                 {
                   required: true,
                   message: 'Please name your NFT',
                 },
               ]}
                placeholder="Please name your NFT">
              <Input />
              </Form.Item>
               <Form.Item
              label="Description"
              name="description"
              rules={[
                 {
                   required: true,
                   message: 'Please describe your NFT',
                 },
               ]}
              placeholder="Please describe your NFT"
              >
                <TextArea
                autoSize={{ minRows: 2, maxRows: 10 }}
                 />
              </Form.Item>


              <Form.Item
               name="category"
               label="Category"
               hasFeedback
               rules={[
                 {
                   required: true,
                   message: 'Please select category',
                 },
               ]}
             >
             <Row
                gutter={24}
                >
              <Col span={10} >
               <Select
                  placeholder="Please select a category"
                  onChange={categoryChange}
                  >
                 <Option value="Music">Music</Option>
                 <Option value="Video">Video</Option>
                 <Option value="Art">Art</Option>
                 <Option value="Dance">Dance</Option>
                 <Option value="Document">Document</Option>
                 <Option value="Technology">Technology</Option>
                 <Option value="Health">Health</Option>
                 <Option value="Event">Event</Option>
               </Select>

             </Col>
             <Col span={6} push={2}>
                <Upload
                   name="image"
                   listType="picture-card"
                   className="avatar-uploader"
                   showUploadList={false}
                   //action="//jsonplaceholder.typicode.com/posts/"
                   beforeUpload={beforeUploadImage}
                   //onChange={this.handleChange}
                 >
                   {token.image!=="" ? <img src={token.image} alt=""/> :
                    (
                      <div>
                        {loadingImage ? <LoadingOutlined/> : <PlusOutlined/>}
                         <div className="ant-upload-text">Image</div>
                         </div>
                    )}
                 </Upload>

                 </Col>
                <Col span={6} push={2}>

                  <Upload
                   name="video"
                   listType="picture-card"
                   className="avatar-uploader"
                   showUploadList={false}
                   //action="//jsonplaceholder.typicode.com/posts/"
                   beforeUpload={beforeUploadVideo}
                   //onChange={this.handleChange}
                 >
                 {token.uri.animation_url!=="" ? <video width="100px" height="100px" src={token.uri.animation_url} alt=""/> :
                    (
                  <div>
                    {loadingVideo ? <LoadingOutlined/> : <PlusOutlined/>}
                      <div className="ant-upload-text">Video or Audio</div>
                  </div>
                  )}
                 </Upload>

                 </Col>
                 </Row>
                 </Form.Item>





              <Form.Item
                label="Unlockable content"
                name="contains_unlockable_content"
              >
              <Switch />
              </Form.Item>

              {showUnlockable?
              (
               <Form.Item
               label="Description"
               name="unlockable_description"
               placeholder="This text and content below can see only the owner of NFT"
               >
                <TextArea
                autoSize={{ minRows: 2, maxRows: 10 }}
                 />
              </Form.Item>
              ):("")}
              <Form.Item >
          <Button type="primary">Create NFT</Button>
        </Form.Item>
      </Form>
    </Card>

        </Col>
        <Col xxl={8} xl={8} lg={6} md={12} sm={24} xs={24}>
            <TokenItem
              item={token}
              small={true}
              preview={true}
              key="MintSmallToken"

              />
        </Col>
        <Col xxl={8}  xl={8} lg={12} md={12} sm={24} xs={24}>
         <TokenItem
              item={token}
              key="MintBigToken"
              preview={true}

              />
        </Col>
        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
         <TokenItem
              item={token}
              key="MintBigToken"
              preview={true}

              />
        </Col>

      </Row>
    </div>
  );
};

export default MintPrivate;
