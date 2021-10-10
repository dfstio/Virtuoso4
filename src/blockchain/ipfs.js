import {message} from 'antd';

const { REACT_APP_INFURA_IPFS_PROJECT_ID, REACT_APP_INFURA_IPFS_PROJECT_SECRET } = process.env;
const { BufferList } = require("bl");
const CryptoJS = require('crypto-js');
const sigUtil = require("eth-sig-util");


const DEBUG = true;

const ipfsClient = require('ipfs-http-client');

const auth =
  'Basic ' + Buffer.from(REACT_APP_INFURA_IPFS_PROJECT_ID + ':' + REACT_APP_INFURA_IPFS_PROJECT_SECRET).toString('base64');


const ipfs = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});




/*
const  ipfsAuth = 'Basic ' + Buffer.from(INFURA_IPFS_PROJECT_ID + ':' + INFURA_IPFS_PROJECT_SECRET).toString('base64');
const ipfsHeadersJSON = {
                   authorization: ipfsAuth ,

                      "HTTPHeaders": {
                        "Access-Control-Allow-Credentials": [
                          "true"
                        ],
                        "Access-Control-Allow-Methods": [
                          "PUT",
                          "GET",
                          "POST"
                        ],
                        "Access-Control-Allow-Origin": [
                          "*"
                        ]

                    },
                  };

const ipfs = ipfsAPI("/ip4/127.0.0.1/tcp/5001",
        {headers: [{
        name: 'Access-Control-Allow-Origin',
        value: '*'
        }]}
        );


const  ipfsAuth = 'Basic ' + Buffer.from(INFURA_IPFS_PROJECT_ID + ':' + INFURA_IPFS_PROJECT_SECRET).toString('base64');
const ipfs = ipfsAPI("https://ipfs.infura.io:5001/",
        {headers: [
        {authorization: ipfsAuth},
        {
        name: 'Access-Control-Allow-Origin',
        value: '*'
        }]}
                    );

 const ipfsAuth = 'Basic ' + Buffer.from(INFURA_IPFS_PROJECT_ID + ':' + INFURA_IPFS_PROJECT_SECRET).toString('base64');
const ipfsHeaders = { authorization : {ipfsAuth}, 'Access-Control-Allow-Origin' : '*' };
const infuraHeaders = new Headers( ipfsHeaders );

const ipfs = ipfsAPI({
        host: "ipfs.infura.io",
        port: "5001",
        protocol: "https",
        headers:  infuraHeaders
          }
        );



const ipfs = ipfsAPI("/ip4/127.0.0.1/tcp/5001",
        {headers: [{
        name: 'Access-Control-Allow-Origin',
        value: '*'
        }]}
        );


console.log("ipfsAPI", ipfsAPI);
const ipfs = ipfsAPI({
        host: "ipfs.infura.io",
        port: "5001",
        protocol: "https",
        });
*/

export async function addEncryptedFileToIPFS(file)
{

     if(DEBUG) console.log("addEncryptedFileToIPFS file: ", file);
     try {
     var binaryWA;
     var md5Hash;
     var sha256Hash;
     var result = {
        "IPFShash" : "",
        "password" : "",
        "MD5_Hash": "",
        "SHA256_Hash": "",
        "filetype": "",
        "filename": "",
        "size" : "",
        "lastModified" : ""
        };


      var reader = new FileReader();
      reader.onload = async function(event) {
          const binary = event.target.result;
          binaryWA = CryptoJS.lib.WordArray.create(binary);

          const password = CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Base64);
          //if(DEBUG) console.log("addEncryptedFileToIPFS binary: ", binaryWA, md5Hash, password);
          const ebuff = CryptoJS.AES.encrypt(binaryWA, password).toString();
          //if(DEBUG) console.log("addEncryptedFileToIPFS ebuff: ", ebuff);

          const hash = await ipfs.add(ebuff, {pin: true});
          md5Hash = CryptoJS.MD5(binaryWA).toString();
          sha256Hash = CryptoJS.SHA256(binaryWA).toString();
          result.IPFShash = hash.path;
          result.password = password;
          result.MD5_Hash = md5Hash;
          result.SHA256_Hash = sha256Hash;
          result.filename = file.name;
          result.filetype = file.type;
          result.lastModified = file.lastModified;
          result.size = file.size;
          if(DEBUG) console.log("addEncryptedFileToIPFS onload result: ", result);
     };

      await reader.readAsArrayBuffer(file);
      if(DEBUG) console.log("addEncryptedFileToIPFS result: ", result);
      message.success(`File ${file.name} uploaded to IPFS with hash ${result.IPFShash}`);
      return result;


    } catch (error) {
      console.log('addEncryptedFileToIPFS Error uploading file: ', error);
      message.error(`Error uploading file ${file.name} to IPFS`);
    }
};


async function encryptUnlockableContent(content, key)
{

   let encryptedContent = {
      "data": "",
      "key": "",
      "exists": false,
      "method": ""
      };

    if (content==undefined) return encryptedContent;
    if (content=="") return encryptedContent;

    if (key == "")
    {
        console.error("encryptUnlockableContent - publicKey is empty",  key);
        return encryptedContent;
    }
    else
    {
        //let msg = content.unlockable;
        //msg.description = content.unlockable_description;
        const msg = JSON.stringify(content);
        const password = CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Base64);
        if(DEBUG) console.log('msg: ', msg, " password: ", password);

        encryptedContent.data = CryptoJS.AES.encrypt(msg, password).toString();


          const buf = Buffer.from(
                 JSON.stringify(
                     sigUtil.encrypt(
                     key,
                     {data: password},
                     "x25519-xsalsa20-poly1305"
                     )
                 ),
                 "utf8"
               );

          encryptedContent.key = "0x" + buf.toString("hex");
          if(DEBUG) console.log("encryptUnlockableContent encrypted: ", encryptedContent);
          encryptedContent.exists = true;
          encryptedContent.method = { "unlockableContentKey" : "MetaMask.eth-sig-util.encrypt.x25519-xsalsa20-poly1305", "unlockableContent": "crypto-js.AES.encrypt"};
          return encryptedContent;
    };

};


export async function encryptUnlockableToken(token, key)
{
      let content = {
          "unlockable_description": "",
          "image": "",
          "video": "",
          "audio": "",
          "pdf": "",
          "files": "",
          "files_number": 0
      };

      let encryptedContent = {
      "data": "",
      "key": "",
      "exists": false,
      "method": ""
      };


      try {

           if( token.unlockable.image !== "") content.image = await addEncryptedFileToIPFS(token.unlockable.image);
           if( token.unlockable.video !== "") content.video = await addEncryptedFileToIPFS(token.unlockable.video);
           if( token.unlockable.audio !== "") content.audio = await addEncryptedFileToIPFS(token.unlockable.audio);
           if( token.unlockable.pdf !== "")   content.pdf   = await addEncryptedFileToIPFS(token.unlockable.pdf);
           content.unlockable_description = token.unlockable_description;

           const length = token.unlockable.files_number;
           if( length > 0)
           {
                   let i;
                   let filesJSON = [];
                   for(i = 0; i<length; i++)
                   {
                        const newFile = await addEncryptedFileToIPFS(token.unlockable.files[i].originFileObj);
                        filesJSON.push(newFile);
                   };
                   content.files_number = length;
                   content.files = filesJSON;

           };
           if(DEBUG) console.log('encryptUnlockableToken: ', content);
           const encryptedContent = await encryptUnlockableContent(content, key);
           return encryptedContent ;

      } catch (error) {console.error("encryptUnlockableToken error:", error)}

      return encryptedContent ;
};

export async function decryptUnlockableToken(data, password)
{
      let content = {
          "unlockable_description": "",
          "image": "",
          "video": "",
          "audio": "",
          "pdf": "",
          "files": "",
          "files_number": 0,
          "loaded": false
      };

      try {

        var bytes  = CryptoJS.AES.decrypt(data, password);
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if(DEBUG) console.log('decrypted: ', decryptedData);


        if( decryptedData.image !== "")
        {
             const imageFile = await getEncryptedFileFromIPFS(decryptedData.image.IPFShash, decryptedData.image.password, decryptedData.image.filetype);
             content.image = imageFile;
        };

        if( decryptedData.video !== "")
        {
             const videoFile = await getEncryptedFileFromIPFS(decryptedData.video.IPFShash, decryptedData.video.password, decryptedData.video.filetype);
             content.video = videoFile;
        };

        if( decryptedData.audio !== "")
        {
             const audioFile = await getEncryptedFileFromIPFS(decryptedData.audio.IPFShash, decryptedData.audio.password, decryptedData.audio.filetype);
             content.audio = audioFile;
        };

        if( decryptedData.pdf !== "")
        {
             const pdfFile = await getEncryptedFileFromIPFS(decryptedData.pdf.IPFShash, decryptedData.pdf.password, decryptedData.pdf.filetype);
             content.pdf = pdfFile;
        };


        let i = 0;
        let filesText = [];

        for( i=0; i<decryptedData.files_number; i++)
        {
             const extraFile = await getEncryptedFileFromIPFS(decryptedData.files[i].IPFShash, decryptedData.files[i].password, decryptedData.files[i].filetype);
             //if(DEBUG) console.log("Extra file " , i, " : ",  extraFile);
             const key = "ufileTokenView" + i.toString();
             filesText.push( <p key={key}><a href={extraFile} target="_blank" > File: {decryptedData.files[i].filename} </a> </p>);

        };

        content.files = filesText;
        content.files_number = decryptedData.files_number;
        content.unlockable_description = decryptedData.unlockable_description;
        content.loaded = true;

        if(DEBUG) console.log("decryptUnlockableToken result: " , content);


        } catch (error) {console.error("decryptUnlockableToken error:", error)}

        return content;

};

export async function addFileHashToIPFS(file)
{

     if(DEBUG) console.log("addFileHashToIPFS file: ", file);

     try {
     var binaryWA;
     var md5Hash;
     var sha256Hash;
     var result = {
        "IPFShash" : "",
        "MD5_Hash": "",
        "SHA256_Hash": "",
        "filetype": "",
        "filename": "",
        "size" : "",
        "lastModified" : "",
        "url": ""
        };


      var reader = new FileReader();
      reader.onload = async function(event) {
          const binary = event.target.result;
          binaryWA = CryptoJS.lib.WordArray.create(binary);

          md5Hash = CryptoJS.MD5(binaryWA).toString();
          sha256Hash = CryptoJS.SHA256(binaryWA).toString();
          result.MD5_Hash = md5Hash;
          result.SHA256_Hash = sha256Hash;
          result.filename = file.name;
          result.filetype = file.type;
          result.lastModified = file.lastModified;
          result.size = file.size;
          //if(DEBUG) console.log("addFileHashToIPFS onload result: ", result);
     };

      await reader.readAsArrayBuffer(file);
      const hash = await ipfs.add(file, {pin: true});
      result.IPFShash = hash.path;
      result.url = `https://ipfs.io/ipfs/${hash.path}`;

      if(DEBUG) console.log("addFileHashToIPFS result: ", result);
      return result;


    } catch (error) {
      console.log('addFileHashToIPFS Error uploading file: ', error)
    }
};



function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export async function getEncryptedFileFromIPFS(hash, key, filetype)
{
     if( hash === undefined || hash === "" ) return "";

     try {

     const file = await getFromIPFS(hash);
     //if (DEBUG) console.log("getEncryptedFileFromIPFS file: ", file);
     const ebuf = file.toString();
     //if (DEBUG) console.log("getEncryptedFileFromIPFS ebuf: ", ebuf);
     var bytes  = CryptoJS.AES.decrypt(ebuf, key);
     //if (DEBUG) console.log("getEncryptedFileFromIPFS bytes: ", bytes);
     const dcBase64String = bytes.toString(CryptoJS.enc.Base64); // to Base64-String
     const dcArrayBuffer = _base64ToArrayBuffer(dcBase64String); // to ArrayBuffer
     var blob = new Blob( [ dcArrayBuffer ], { type: filetype } );
     //let filename = new File([ dcArrayBuffer ], "album1.jpeg", {type: filetype });
     var urlCreator = window.URL || window.webkitURL;
     var imageUrl = urlCreator.createObjectURL( blob);
     return imageUrl;


    } catch (error) {
      console.log('getEncryptedFileFromIPFS Error: ', error)
    }
};


// helper function to "Get" from IPFS
// you usually go content.toString() after this...
/*
export async function getFromIPFS( hashToGet)
{
  if (DEBUG) console.log("getFromIPFS hash:", hashToGet);
  for await (const file of ipfs.get(hashToGet))
  {
    if (DEBUG) console.log("getFromIPFS file:", file);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    if (DEBUG) console.log("getFromIPFS Content: ", content);
    return content;
  }
};
*/
export async function getFromIPFS( hashToGet)
{
    if (DEBUG) console.log("getFromIPFS hash:", hashToGet);
    const content = new BufferList();
    for await (const chunk of ipfs.cat(hashToGet)) {
      content.append(chunk);
    };
    if (DEBUG) console.log("getFromIPFS Content: ", content);
    if( DEBUG && content !== undefined ) console.log("getFromIPFS Content as string: ", content.toString());
    return content;
};



export async function addToIPFS( str )
{
	const result = await ipfs.add(str, {pin: true});
	return result;
};


export async function addFileToIPFS(file)
{
try {
      const hash = await ipfs.add(file, {pin: true});
      return hash;
    } catch (error) {
      console.log('addFileToIPFS Error uploading file: ', error)
    }
};
