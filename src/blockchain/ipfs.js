const { REACT_APP_INFURA_IPFS_PROJECT_ID, REACT_APP_INFURA_IPFS_PROJECT_SECRET } = process.env;

//const ipfsAPI = require("ipfs-http-client");
const { BufferList } = require("bl");
//const fs = require('fs');
const CryptoJS = require('crypto-js');

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
      return result;


    } catch (error) {
      console.log('addEncryptedFileToIPFS Error uploading file: ', error)
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
export async function getFromIPFS( hashToGet)
{
  for await (const file of ipfs.get(hashToGet))
  {
    if (DEBUG) console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    if (DEBUG) console.log("getFromIPFS Content: ", content);
    return content;
  }
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
