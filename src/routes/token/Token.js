import React, {useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {message} from 'antd';
import {updateAddress, updateVirtuosoBalance, updatePublicKey} from "../../appRedux/actions";
import {Button, Row, Col} from "antd";
import {LoadingOutlined, ExpandOutlined, CloseCircleFilled } from '@ant-design/icons';
import IntlMessages from "util/IntlMessages";
import { metamaskLogin, virtuosoRegisterPublicKey, getVirtuosoUnlockableContentKey, metamaskDecrypt } from "../../blockchain/metamask";
import  SellButton  from "../algolia/Sell";
import ReactPlayer from 'react-player';
const { getFromIPFS, decryptUnlockableToken } = require("../../blockchain/ipfs");


const DEBUG = true;
const content = {
          "unlockable_description": "",
          "image": "",
          "video": "",
          "audio": "",
          "pdf": "",
          "files": "",
          "files_number": 0,
          "loaded": false
      };



const MediaList = ({hits}) => {
  if(DEBUG) console.log("MediaList", hits);
  return (
    <div id="product">
      <Row>
        {hits.map(media => (
          <Col xl={8} lg={12} md={12} sm={12} xs={24}>
            <TokenMedia
              media={media}
              key={media.IPFShash}

              />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const TokenMedia = ({media}) => {
      //const [loading, setLoading] = useState(true);
      const [content, setContent] = useState("<LoadingOutlined />{media.name}");

      useEffect(() => {
            async function fetchMedia() {
              let newContent = "";
              const type = media.filetype.replace(/\/[^/.]+$/, "");

              switch(type)
              {
                  case "image": newContent = (<img src={media.url} alt={media.name}/>); break;
                  case "video": newContent = (
                                                  <ReactPlayer
                                                     url={media.url}
                                                     controls={true}
                                                     //light={true}
                                                     width='100%'
                                                     height='100%'
                                                     />

                          ); break;
                  default: newContent = (<CloseCircleFilled />);

              };
              if(DEBUG) console.log(`TokenMedia ${type}:`, content);
              setContent(newContent);
              //setLoading(false);
        }
      fetchMedia()
      },[media]);

  return (
    <div className="gx-product-item gx-product-vertical" >
      <div className="gx-product-image">
        {content}
      </div>
      <div className="gx-product-body" >

        <div className="gx-product-name">
        <span>
          {media.name}
        </span>
         <span style={{ float: "right"}}>
            <ExpandOutlined />
        </span>
        </div>


        <div className="gx-mt-4">
          {media.description}
        </div>
      </div>
    </div>
  );

};

const TokenAudio = ({media}) => {
      const [loading, setLoading] = useState(true);
      const [content, setContent] = useState("<LoadingOutlined />{media.name}");








};



const TokenItem = ({item, small=false, preview=false}) => {
  //const icons = [];
  //if(DEBUG) console.log("Item: ", item, small, preview);
  const address = useSelector(({blockchain}) => blockchain.address);
  const publicKey = useSelector(({blockchain}) => blockchain.publicKey);
  const dispatch = useDispatch();
  const [unlockable, setUnlockable] = useState(content);
  const [loadingUnlockable, setLoadingUnlockable] = useState(false);

  const [media, setMedia] = useState([]);
  const [attachemts, setAttachments] = useState("");
  const [uattachemts, setUAttachments] = useState("");
  const [audio, setAudio] = useState("");
  const [uaudio, setUAudio] = useState("");

  useEffect(() => {
            async function loadMedia() {
              let newMedia = [];

              if( item.uri.properties.image!== "") newMedia.push(item.uri.properties.image);
              if( item.uri.properties.animation!== "")
              {
                   const type = item.uri.properties.animation.filetype.replace(/\/[^/.]+$/, "");
                   if( type === 'video') newMedia.push(item.uri.properties.animation);
              };
              const count  = (item.uri.media_count === undefined)? 0 : item.uri.media_count;

              if( count > 0)
              {
                      let i;

                      for(i = 0; i<count; i++)
                      {
                           newMedia.push(item.uri.media[i]);
                           newMedia[i].unlockable = false;
                      };

              };
              setMedia(newMedia);
              if(DEBUG) console.log(`TokenItem media ${count}:`, newMedia);
        }
      loadMedia()
      },[item]);


  let buttonId = "sidebar.algolia.buy";
  let canSell = false;
  if( address.toUpperCase() === item.owner.toUpperCase())
  {
      buttonId = "sidebar.algolia.sell";
      canSell = true;
  }

  async function register()
  {

            if(DEBUG) console.log("Register clicked", address);
            if( address !== undefined && address !== "")
            {
                 const key = 'RegisterPublicKeyTokenItem';
                 message.loading({content: `To view unlockable content please provide public key in Metamask and confirm transaction`, key, duration: 60});

                const result = await virtuosoRegisterPublicKey(address);
                if( result.publicKey !== "" && result.hash !== "")
                {
                    dispatch(updatePublicKey(result.publicKey));
                    message.success({content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`, key, duration: 30});
                    return publicKey;
                }
                else message.error({content: `Public key is not provided or written to blockchain`, key, duration: 10});

            };
            return "";
  }

  const loadUnlockable = async () => {

         const key = 'loadUnlockable';
         setLoadingUnlockable(true);
         message.loading({content: `Loading unlockable content from blockchain`, key, duration: 240});


         try {
              const encryptedKey = await getVirtuosoUnlockableContentKey(item.tokenId, address);
              if(DEBUG)  console.log("View - unlockable key: ", encryptedKey);

              if( encryptedKey !== "")
              {
                  const unlockableIPFS = await getFromIPFS(encryptedKey);
                  //if(DEBUG)  console.log("unlockable unlockableIPFS: ", unlockableIPFS );
                  let unlockableJSON = JSON.parse(unlockableIPFS.toString());
                  const password = await metamaskDecrypt( unlockableJSON.key, address );
                  const decryptedData = await decryptUnlockableToken(unlockableJSON.data, password);

                  setUnlockable(decryptedData);
                  if(DEBUG)  console.log("View - Decrypted data: ", decryptedData);
                  message.success({content: `Unlockable content loaded`, key, duration: 30});


              } else message.error({content: `Error loading unlockable content`, key, duration: 30});

         } catch(error)
         {
            console.error("loadUnlockable error:", error);
            message.error({content: `Error loading unlockable content`, key, duration: 30});
         }

         setLoadingUnlockable(false);
};


  async function showUnlockableContent()
  {
        if(DEBUG) console.log("showUnlockableContent", publicKey, address)
        if( address !== undefined && address !== "")
        {
            if( publicKey === undefined || publicKey === "" || publicKey === 'a' )
            {
                if(DEBUG) console.log("showUnlockableContent wrong public key" , publicKey);
                await register();
            }
            else
            {
                await loadUnlockable();
            }


        } else message.error("Please connect with MetaMask")
  }



  return (
    <div className="gx-product-item gx-product-vertical" >
    <MediaList  hits={media} />

    {(small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === true)?
    (
        <div className="gx-product-body" >
            <div className="gx-product-name" style={{"font-size":16, "color":"#038fde"}}>
              Unlockable content:
             </div>
             <div className="gx-mt-4">
              {unlockable.description}
              </div>

            <div className="gx-product-image" style={{position: "relative"}}>
            {(unlockable.media !== "")?(<span> <img src="blob:http://localhost:8888/bc56bed0-2bc2-4df5-87be-7b8a0da2aaf9" /> </span>):("")}
            {(unlockable.video !== "")?(
             <span>
                    <ReactPlayer
                    url={unlockable.video}
                    controls={true}
                    //light={true}
                    width='100%'
                    height='100%'
                    />
            </span>):("")}
           {(unlockable.audio !== "")?(
             <span>
                    <ReactPlayer
                    url={unlockable.audio}
                    controls={true}
                    //light={true}
                    width='100%'
                    height='100%'
                    />
            </span>):("")}
            {(unlockable.attachments !== "")?(
             <span>
                    {unlockable.attachments}
            </span>):("")}
            </div>
        </div>
     )
     :
     (
       ""
     )}

    {(small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === false)?
    (
        <div className="gx-product-body" >
                <Button
                 onClick={showUnlockableContent}
                 >
                 Show Unlockable Content
                 </Button>

        </div>
     )
     :
     (
       ""
     )}
      <div className="gx-product-body" >

        <div className="gx-product-name">
        <span style={{"font-size":22, "color":"#038fde"}}>
          {item.name}
        </span>
        {canSell?(
        <span style={{ float: "right"}}>
        <SellButton
        item = {item}
        address = {address}
        />
        </span>
        )
        :
        (
        <span>
        {item.onSale?(
        <span style={{ float: "right"}}>
          <Button
          type="primary"
          onClick={ async () => {
                    if(DEBUG) console.log("Buy clicked");

                    message.loading("Preparing checkout page", 10);
                    const myaddress = await metamaskLogin(false);
                    dispatch(updateAddress(myaddress));

                    if( myaddress !== item.owner)
                    {
                           let buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                            "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();
                           if( myaddress !== "")
                           {
                               buyTokenPath = "/api/create-checkout-session?type=buy&address=" + myaddress +
                                 "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();;
                           };

                           let form = document.createElement('form');

                           form.action = buyTokenPath;
                           form.method = 'POST';

                           // the form must be in the document to submit it
                           document.body.append(form);

                           form.submit();
                    }
                    else
                    {
                          message.error("You already own this NFT token", 10);
                    };

                }}

          >
            <IntlMessages id={buttonId}/>
            </Button>
        </span>
        ):("")}
         </span>
        )}
        </div>
        <div className="gx-mb-3">
          {item.category}
        </div>


        {item.onSale?(
        <div className="gx-product-price"  >
           <span >
            Token {item.vrtTokenId}
             </span>
         <span style={{ float: "right"}}>
          {item.currency} {item.price}
           </span>

          </div>

        ):(
            <div className="gx-product-price">
            Token {item.vrtTokenId}
            </div>
          )
        }
        <div className="gx-mt-4">
         {item.description}
        </div>
      </div>
    </div>
  );
};

export default TokenItem;
