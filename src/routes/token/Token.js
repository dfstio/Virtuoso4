import React, {useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {message} from 'antd';
import {updateAddress, updateVirtuosoBalance, updatePublicKey} from "../../appRedux/actions";
import {Button, Row, Col} from "antd";
import {LoadingOutlined, ExpandOutlined, CloseCircleFilled, CaretUpFilled, CaretDownFilled } from '@ant-design/icons';
import IntlMessages from "util/IntlMessages";
import { metamaskLogin, virtuosoRegisterPublicKey, getVirtuosoUnlockableContentKey, metamaskDecrypt } from "../../blockchain/metamask";
import  SellButton  from "../algolia/Sell";
import ReactPlayer from 'react-player';
import ReactJkMusicPlayer from 'react-jinke-music-player'
import 'react-jinke-music-player/assets/index.css'
import 'react-jinke-music-player/lib/styles/index.less';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import "./style.css";
import Markdown from 'markdown-to-jsx';
//import '../../styles/token/audio-player.less';

const { getFromIPFS, decryptUnlockableToken, getEncryptedFileFromIPFS } = require("../../blockchain/ipfs");

const DEBUG = true;


const MediaList = ({hits, onSelect, pdfPages, counter}) => {
  if(DEBUG) console.log("MediaList", hits);
  return (
    <div id="medialist">
      <Row>
        {hits.map(media => (
          <Col xl={12} lg={12} md={12} sm={24} xs={24}>
            <TokenMedia
              media={media.data}
              onSelect={onSelect}
              key={media.IPFShash}
              mediaId={media.id}
              pdfPages={pdfPages}
              counter1={counter}

              />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const TokenMedia = ({media, onSelect, key, mediaId, pdfPages, counter1}) => {
      const [loading, setLoading] = useState(true);
      if(DEBUG) console.log("TokenMedia: ", mediaId, media);
      const [content, setContent] = useState("");
      const [numPages, setNumPages] = useState(null);
      const [pageNumber, setPageNumber] = useState(1);
      const [pdf, setPDF] = useState(false);
      const [counter, setCounter] = useState(0);


      if(media.pdf!==undefined && media.pdf.page !== pageNumber) setPageNumber(media.pdf.page);


      function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        if(DEBUG) console.log("onDocumentLoadSuccess PDF pages", numPages);
        pdfPages(mediaId, numPages, pageNumber);
      }

      function changePage(offset) {
        const newPageNumber = pageNumber + offset;
        setPageNumber(newPageNumber);
        setCounter(counter+1);
        pdfPages(mediaId, numPages, newPageNumber);
      }

      function previousPage() {
        if(pageNumber > 1) changePage(-1);
      }

      function nextPage() {
        if(pageNumber < numPages) changePage(1);

      }

      function selectMe() {
        onSelect(mediaId);
      }

      useEffect(() => {
            async function fetchMedia() {

            if( media.url !== "")
            {
              let newContent = (<CloseCircleFilled />);
              const type = media.filetype.replace(/\/[^/.]+$/, "");

              switch(type)
              {
                  case "image": newContent = (<img src={media.url} alt={media.name}/>); setContent(newContent); setLoading(false); break;
                  case "video": newContent = (
                                                  <ReactPlayer
                                                     url={media.url}
                                                     controls={true}
                                                     //light={true}
                                                     width='100%'
                                                     height='100%'
                                                     />

                          ); setContent(newContent); setLoading(false); break;

                   case "application":
                      if( media.filetype === "application/pdf" ) setPDF(true); setLoading(false); break;

              };
            };
        }
      fetchMedia()
      },[media, counter1]);

  return (
    <div className="gx-product-item gx-product-vertical" >
      <div className="gx-product-image">
      {(loading === false && pdf)?
      (
            <div>
            <Document
              file={media.url}
              className="gx-product-image"
              onLoadSuccess={onDocumentLoadSuccess}
             >
              <Page
                pageNumber={pageNumber}
                className="gx-product-name"
                width="800"
              />
            </Document>
          </div>
      )
      :
      (
        <div>
        {content}
        </div>
      )}
      </div>
      <div className="gx-product-body" >

        <div className="gx-product-name">

          {loading?(<span><LoadingOutlined />{media.name}</span>):(<span>{media.name}</span>)}

         <span style={{ float: "right"}}>
            {(loading === false && pdf)?
            (
                <span style={{"margin-right":"20px"}}>
                Page {pageNumber} of {numPages} {"     "}
                <CaretUpFilled onClick={previousPage} />{"  "}
                <CaretDownFilled onClick={nextPage} disabled={pageNumber >= numPages}/>
                 </span>
            ):("")}
            <span><ExpandOutlined onClick={selectMe} /></span>
        </span>
        </div>


        <div className="gx-mt-4">
          {media.description}
        </div>
      </div>
    </div>
  );

};

/*
const AudioList = ({hits}) => {
  if(DEBUG) console.log("AudioList", hits);
  return (
    <div id="audiolist" className="gx-product-body">
        {hits.map(media => (
            <TokenAudio
              media={media}
              key={media.IPFShash}
              />
        ))}
    </div>
  );
};

*/


const TokenAudio = ({audioList}) => {

if(DEBUG) console.log("TokenAudio: ", audioList.length, audioList);
/*
    const options = {
  // audio lists model
      audioLists: audioList,
      mode: 'full',
      theme: 'light',
      toggleMode: false,
      showReload: false,
      showDownload: false,
      showThemeSwitch: false,
      autoHiddenCover: true,
      responsive: false,
      autoPlay: false
      };
*/




  return (
            <div className="gx-product-name" style={{"margin-bottom": "10px", "primary-color": "#f63"}}>
            <ReactJkMusicPlayer
                    audioLists={audioList}
                    quietUpdate={true}
                    clearPriorAudioLists={true}
                    mode='full'
                    theme= 'light'
                    toggleMode= {false}
                    showReload= {false}
                    showDestroy= {false}
                    showDownload= {false}
                    showThemeSwitch= {false}
                    autoHiddenCover= {true}
                    responsive= {false}
                    autoPlay= {false}
              />
            </div>


         );
};



const TokenItem = ({item, small=false, preview=false}) => {
  //const icons = [];
  //if(DEBUG) console.log("Item: ", item, small, preview);

    const content = {
          "description": "",
          "media": "",
          "media_count": 0,
          "attachments": "",
          "attachments_count": 0,
          "loaded": false
      };


  const address = useSelector(({blockchain}) => blockchain.address);
  const publicKey = useSelector(({blockchain}) => blockchain.publicKey);
  const dispatch = useDispatch();
  const [unlockable, setUnlockable] = useState(content);
  const [loadingUnlockable, setLoadingUnlockable] = useState(false);
  const [showUnlockableButton, setShowUnlockableButton] = useState(false);

  const [media, setMedia] = useState([]);
  const [attachemts, setAttachments] = useState("");
  const [uattachemts, setUAttachments] = useState("");
  const [audio, setAudio] = useState([]);
  const [uaudio, setUAudio] = useState([]);
  const [counter, setCounter] = useState(0);

  const [currentMedia, setCurrentMedia] = useState(null);

  useEffect(() => {
            function checkAddress() {
            let show = false;
            if( address === item.owner) show = true;
            if( show !== showUnlockableButton) setShowUnlockableButton(show);
          }
      checkAddress()
      },[address]);


  useEffect(() => {
            async function loadMedia() {
              let newMedia = [];
              let newAudio = [];

              if( item.uri.properties.image!== "") { const id = newMedia.length; newMedia.push({data:item.uri.properties.image, id:id}); };
              if( item.uri.properties.animation!== "")
              {
                   const type = item.uri.properties.animation.filetype.replace(/\/[^/.]+$/, "");
                   if( type === 'video') { const id = newMedia.length; newMedia.push({data:item.uri.properties.animation, id:id});};
                   if( type === 'audio')
                   {
                        let track = {
                                name: item.uri.properties.animation.name,
                                musicSrc: item.uri.properties.animation.url,
                                };
                        if( item.image !== "") track.cover = `https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/${item.image}`;
                        newAudio.push(track);
                    };
              };
              const count  = (item.uri.media_count === undefined)? 0 : item.uri.media_count;

              if( count > 0)
              {
                      let i;

                      for(i = 0; i<count; i++)
                      {
                           const type = item.uri.media[i].filetype.replace(/\/[^/.]+$/, "");
                           const id = newMedia.length;
                           if( type === 'video') newMedia.push({data:item.uri.media[i], id:id});
                           if( type === 'image') newMedia.push({data:item.uri.media[i], id:id});
                           if( type === 'audio')
                           {
                                 let track = {
                                         name: item.uri.media[i].name,
                                         musicSrc: item.uri.media[i].url,
                                         };
                                 if( item.image !== "") track.cover = `https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/${item.image}`;
                                 newAudio.push(track);
                           };
                           if( type === "application")
                           {
                               if( item.uri.media[i].filetype === "application/pdf" ) newMedia.push({data:item.uri.media[i], id:id});
                           };
                      };

              };
              setMedia(newMedia);
              setAudio(newAudio);
              if(DEBUG) console.log(`TokenItem media ${count}:`, newMedia, newAudio);
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

  const fetchUnlockable = async (newMedia, initial_count, count) => {

         let i;
         let media2 = newMedia;
         if(DEBUG) console.log(`fetchUnlockable:`, initial_count, count, newMedia);

         for(i = initial_count; i<(count+initial_count); i++)
         {
            const url = await getEncryptedFileFromIPFS(newMedia[i].data.IPFShash, newMedia[i].data.password, newMedia[i].data.filetype);
            media2[i].data.url = url;
            setMedia(media2);
            setCounter(counter+1);
         };

  };


  const addUnlockable = async (media1, count) => {

              let newMedia = media;
              let newAudio = audio;
              const initial_count = newMedia.length;
              let newCount = 0;


              if( count > 0)
              {
                      let i;

                      for(i = 0; i<count; i++)
                      {
                           const type = media1[i].filetype.replace(/\/[^/.]+$/, "");
                           const id = newMedia.length;
                           if( type === 'video') { newMedia.push({data:media1[i], id:id}); newCount++; setMedia(newMedia);setCounter(counter+1);};
                           if( type === 'image') { newMedia.push({data:media1[i], id:id}); newCount++; setMedia(newMedia);setCounter(counter+1);};
                           if( type === 'audio')
                           {
                                 let track = {
                                         name: media1[i].name,
                                         musicSrc: await getEncryptedFileFromIPFS(media1[i].IPFShash, media1[i].password, media1[i].filetype)
                                         };
                                 if( item.image !== "") track.cover = `https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/${item.image}`;
                                 newAudio.push(track);

                           };
                           if( type === "application")
                           {
                               if( media1[i].filetype === "application/pdf" ) { newMedia.push({data:media1[i], id:id}); newCount++; setMedia(newMedia);setCounter(counter+1);};
                           };
                      };

              };
              setMedia(newMedia);
              setAudio(newAudio);

              if(DEBUG) console.log(`addUnlockable media ${count}:`, newMedia, newAudio);
              await fetchUnlockable(newMedia, initial_count, newCount);

 };



  const loadUnlockable = async () => {

         const key = 'loadUnlockable';
         setLoadingUnlockable(true);
         message.loading({content: `Loading unlockable content from blockchain`, key, duration: 6000});


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


                  setCounter(counter+1);
                  await addUnlockable(decryptedData.media, decryptedData.media_count);
                  message.success({content: `Unlockable content loaded`, key, duration: 30});
                  if(DEBUG) console.log(`loadUnlockable media:`, media, "audio", audio);


              } else message.error({content: `Error loading unlockable content`, key, duration: 30});

         } catch(error)
         {
            console.error("loadUnlockable error:", error);
            message.error({content: `Error loading unlockable content`, key, duration: 30});
         }

         setLoadingUnlockable(false);
         setCounter(counter+1);
         sleep(1000);
         setCounter(counter+1);
         sleep(1000);
         setCounter(counter+1);

};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

 function onSelect(id)
  {
        if(DEBUG) console.log("onSelect current", currentMedia, "selected", id);
        if(currentMedia !== null) setCurrentMedia(null);
        else setCurrentMedia(id);
  }

  function pdfPages(id, numPages, page)
  {
        if(DEBUG) console.log("pdf", id, numPages, page);
        media[id].data.pdf = {numPages: numPages, page: page};
  }


  return (
    <div className="gx-algolia-content-inner" >
    {(loadingUnlockable || audio.length===0)?(""):(<TokenAudio  audioList={audio} key="audiounlockable" />)}
    {(currentMedia !== null) ?
    (
        <div>

        <i
            className="icon icon-arrow-left gx-icon-btn"
            onClick={() => { setCurrentMedia(null) }}
        />
        <TokenMedia
              media={media[currentMedia].data}
              onSelect={onSelect}
              key={media[currentMedia].data.IPFShash}
              mediaId={currentMedia}
              pdfPages={pdfPages}
              counter={counter}

        />

        </div>
    )
    :
    (  <div>

       <div className="gx-product-item">
       <div className="gx-product-body">


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
             {item.vrtTokenId}
            </div>
          )
        }
        <div className="gx-mt-4">
         <Markdown>
            {item.description}
         </Markdown>
        </div>



   {(small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === true)?
    (
        <div className="gx-mt-4" >

            <div className="gx-product-name" style={{"font-size":16, "color":"#038fde"}}>
              Unlockable content:
             </div>
             <div className="gx-mt-2">
             <Markdown>
              {unlockable.description}
              </Markdown>
              </div>

            <div className="gx-mt-4" style={{position: "relative"}}>
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

    {(showUnlockableButton && small===false && preview === false && item.uri.contains_unlockable_content === true && unlockable.loaded === false)?
    (
        <div className="gx-product-image" style={{"margin-top": "25px"}} >
                <Button
                 onClick={showUnlockableContent}
                 loading={loadingUnlockable}
                 >
                 Show Unlockable Content
                 </Button>

        </div>
     )
     :
     (
       ""
     )}
      </div>
      </div>


        <MediaList  hits={media} onSelect={onSelect} pdfPages={pdfPages} counter={counter}/>
        </div>
    )}
    </div>
  );
};

export default TokenItem;
