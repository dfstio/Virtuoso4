import React, {useState} from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button, Row, Col, Form, Input, Radio, Card, Upload, Switch, Select } from "antd";
import TokenItem from '../token/Token';
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {message} from 'antd';
import IntlMessages from "util/IntlMessages";
import { virtuosoMint } from "../../blockchain/metamask";

const { addFileHashToIPFS, addToIPFS } = require("../../blockchain/ipfs");

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
  "name": "",
  "description": "",
  "shortdescription": "",
  "saleID": 0,
  "onSale": false,
  "saleStatus": "on sale",
  "price": 101,
  "currency": "USD",
  "category": "Music",
  "image": "",
  "contains_unlockable_content": false,
  "unlockable_description": "",
  "uri": {
    "name": "",
    "type": "object",
    "image": "",
    "external_url": "nftvirtuoso.io",
    "animation_url": "",
    "description": "",
    "license": "NFT Virtuoso Personal License Agreement V1",
    "license_id": "0",
    "license_url": "https://arweave.net/wCPAjAJISEeHgrFCkX1xKML1ZF9A4pKT0ij0SmrQyJU",
    "contains_unlockable_content": false,
    "unlockable_content_encryption": {
      "unlockableContentKey": "MetaMask.eth-sig-util.encrypt.x25519-xsalsa20-poly1305",
      "unlockableContent": "crypto-js.AES.encrypt"
    },
    "properties": {
      "image": "",
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
    "price": 100,
    "type": "fixedprice",
    "currency": "usd",
    "comment": "test",
    "contains_unlockable_content": false,
    "operator": {
      "address": "",
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
  const [minting, setMinting] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [showUnlockable, setShowUnlockable] = useState(false);
  const [mintDisabled, setMintDisabled] = useState(true);
  const [form] = Form.useForm();



  const checkCanMint = () => {

        let newMintDisabled = true;
        if( token.name !== "" && token.description !== "" && token.image !== "" && address !== "") newMintDisabled = false;
        if( newMintDisabled !== mintDisabled ) setMintDisabled(newMintDisabled);
  };

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
    checkCanMint();


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
    checkCanMint();

  };

    const beforeUploadImage = async (file) => {

        if(DEBUG) console.log("beforeUploadImage ", file);
        setLoadingImage(true);
        let newToken = token;
        const key = 'IPFSimageloading';
        message.loading({content: `Uploading ${file.name} to IPFS`, key});

        const result = await addFileHashToIPFS(file);
        if(DEBUG) console.log("Image File added to IPFS: ", result);
        newToken.image = result.url;
        newToken.uri.properties.image = result;
        message.success({content: `File ${file.name} uploaded to ${result.url}`, key, duration: 5});
        setToken(newToken);
        setLoadingImage(false);
        checkCanMint();
        return false;
  };

    const beforeUploadVideo = async (file) => {
        if(DEBUG) console.log("beforeUploadVideo ", file);
        setLoadingVideo(true);
        let newToken = token;
        const key = 'IPFSvideoloading';
        message.loading({content: `Uploading ${file.name} to IPFS`, key, duration: 60});
        const result = await addFileHashToIPFS(file);
        if(DEBUG) console.log("Video File added to IPFS: ", result);


        newToken.uri.animation_url = result.url;
        newToken.uri.properties.animation = result;
        message.success({content: `File ${file.name} uploaded to ${result.url}`, key, duration: 5});
        setToken(newToken);
        setLoadingVideo(false);
        checkCanMint();
        return false;
  };

    const mint = async () => {
    if(DEBUG) console.log("Mint token: ", token);
    setMinting(true);
    const key = 'MintingPrivate';
    message.loading({content: `Minting NFT token - uploading to IPFS`, key, duration: 60});


    //let key = mmPublicKey;
    //if (key == "") key = await acceptLicense();

    //const encryptedContent = await encryptUnlockableContent(yourJSON, key); // yourJSON.unlockable_content)
    try{

    let mintJSON = {
      "name": token.name,
      "type": "object",
      "category": token.category,
      "visibility": "private",
      "image": token.image,
      "external_url": "nftvirtuoso.io",
      "animation_url": token.uri.animation_url,
      "description": token.description,
      "license": "NFT Virtuoso Personal License Agreement V1",
      "license_id": "0",
      "license_url": "https://arweave.net/wCPAjAJISEeHgrFCkX1xKML1ZF9A4pKT0ij0SmrQyJU",
      "contains_unlockable_content": false,
      //"unlockable_content_encryption": encryptedContent.method,
      "properties": token.uri.properties,
      "attributes": [
      {"trait_type": "Category", "value": token.category},
        ]
      };


    if(DEBUG) console.log("MINT - UPLOADING URI...", mintJSON);
    //, "from yourJSON", yourJSON, "and encryptedContent", encryptedContent);

    const result = await addToIPFS(JSON.stringify(mintJSON))

    //var unlockableResult = { "path": "" };
    //if( encryptedContent.key != "") unlockableResult = await addToIPFS(JSON.stringify(encryptedContent));

    if(DEBUG) console.log("ipfsHash uploaded - uri: ", result.path); //, " unlockable: ", unlockableResult.path);
    //if(DEBUG) console.log("Minting NFT with IPFS hashes ", result.path, unlockableResult.path )

    message.loading({content: `Minting NFT token - - sending transaction to blockchain with IPFS hash ${result.path}`, key, duration: 60});
    //tx(writeContracts.VirtuosoNFT.mintItem(address, result.path, unlockableResult.path, false, {gasLimit:1000000}));
    const txresult = await virtuosoMint(address, result.path, "", false);
    if(DEBUG) console.log("Mint  tx: ", txresult );
    message.success({content: `NFT token minted successfully with transaction hash ${txresult.hash}`, key, duration: 10});
    setToken(startToken);

    } catch (error) { console.log("Mint error", error); }


    setMinting(false);

}

  checkCanMint();

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
                  defaultValue="Music"
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
                   {token.image!=="" ? <img src={`https://res.cloudinary.com/virtuoso/image/fetch/h_100,q_100,f_auto/${token.image}`}alt=""/> :
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
              <span style={{ float: "right"}}>
                 <Button
                 type="primary"
                 onClick={mint}
                 disabled={mintDisabled}
                 loading={minting}
                 >
                 Create NFT
                 </Button>
                </span>
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
