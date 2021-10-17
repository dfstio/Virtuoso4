// User client-side code for signing a meta-tx request
// Note that, instead of sending the tx, the end-user signs the request and sends it to a relayer server
// This server will process the request, and if valid, send the tx via a Defender Relayer

//import ethers from 'ethers';

//import BoxesAbi from '../abis/Boxes.json';


const ethers = require("ethers");
const { TypedDataUtils } = require('eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');
const VirtuosoNFTJSON = require("../contract/mumbai_VirtuosoNFT.json");
const ForwarderAbi  = require('./IForwarder.json');


const {REACT_APP_CONTRACT_ADDRESS, REACT_APP_FORWARDER_ADDRESS, REACT_APP_CHAIN_ID} = process.env;
//const ZeroAddress = '0x0000000000000000000000000000000000000000';
//const BoxesAddress = process.env.REACT_APP_BOXES_ADDRESS || ZeroAddress;
//const ForwarderAddress = process.env.REACT_APP_FORWARDER_ADDRESS || ZeroAddress;
const RelayUrl = '/api/relay';
const DEBUG = true;

const EIP712DomainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

const ForwardRequestType = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
  { name: 'validUntil', type:  "uint256" }
]

const TypedData = {
  domain: {
    name: 'NFT Virtuoso', //'GSN Relayed Transaction',
    version: '1', //'2',
    chainId: 80001,
    verifyingContract: REACT_APP_FORWARDER_ADDRESS,
  },
  primaryType: 'ForwardRequest',
  types: {
    EIP712Domain: EIP712DomainType,
    ForwardRequest: ForwardRequestType
  },
  message: {}
};



const GenericParams = 'address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data,uint256 validUntil';
const TypeName = `ForwardRequest(${GenericParams})`;
const TypeHash = ethers.utils.id(TypeName);

const DomainSeparator = bufferToHex(TypedDataUtils.hashStruct('EIP712Domain', TypedData.domain, TypedData.types));
const SuffixData = '0x';



export async function submitPublicKey(publicKey) {

  var provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
  var signer = provider && provider.getSigner();
  // Initialize provider and signer from metamask
  //await window.ethereum.enable();
  //const provider = new ethers.providers.Web3Provider(window.ethereum);
  //const signer = provider.getSigner();
  const from = await signer.getAddress();
  const network = await provider.getNetwork();
  if (network.chainId !== 80001) console.error(`Must be connected to Mumbai`);

  // Get nonce for current signer
  const forwarder = new ethers.Contract(REACT_APP_FORWARDER_ADDRESS, ForwarderAbi, signer);
  const nonce = await forwarder.getNonce(from).then(nonce => nonce.toString());
  //const r1 = await forwarder.registerDomainSeparator("NFT Virtuoso", "1");
  //if(DEBUG) console.log("Relay r1:", r1);



  // Encode meta-tx request
  const virtuosoInterface = new ethers.utils.Interface(VirtuosoNFTJSON);
  const forwarderInterface = new ethers.utils.Interface(ForwarderAbi);
  const data = virtuosoInterface.encodeFunctionData('setPublicKey', [publicKey]);
  const gasEstimate = await provider.estimateGas({
  // Wrapped ETH address
  to: REACT_APP_CONTRACT_ADDRESS,

  // `function deposit() payable`
  data: data,

  // 1 ether
  value: 0
});


  if(DEBUG) console.log("Relay gas:", gasEstimate);
  const nonceNumber = ethers.BigNumber.from(nonce).toHexString()

  const request = {
    from,
    to: REACT_APP_CONTRACT_ADDRESS,
    value: '0x0',
    gas: 1e5,
    nonce,
    data,
    validUntil: "0x0"
  };
  const toSign = { ...TypedData, message: request };

  // Directly call the JSON RPC interface, since ethers does not support signTypedDataV4 yet
  // See https://github.com/ethers-io/ethers.js/issues/830
  const signature = await provider.send('eth_signTypedData_v4', [from, JSON.stringify(toSign)]);


 // const requestdata = { ...request, signature };
  //const forwarder = new ethers.Contract(REACT_APP_FORWARDER_ADDRESS, ForwarderAbi, signer);
  /*
  const args = {forwardRequest:{
                        from: from,
                        to: REACT_APP_CONTRACT_ADDRESS,
                        value: 0,
                        gas: 1e6,
                        nonce: nonceNumber,
                        data: data
                   },
                   validUntil: 15467154871,
                   domainSeparator: DomainSeparator,
                   requestTypeHash: TypeHash,
                   suffixData: SuffixData,
                   signature: signature
                 };

  const args = [
    { to: REACT_APP_FORWARDER_ADDRESS,
      from,
      value:"0x0",
      gas:ethers.BigNumber.from(1000000).toHexString(),
      nonce: nonceNumber,
      data,
      validUntil: "0x0"  },
    DomainSeparator,
    TypeHash,
    SuffixData,
    signature
  ];

  if(DEBUG) console.log("Relay3:", args);
*/


  //const forwarderData = forwarderInterface.encodeFunctionData('execute', args );
  const forwarderData = forwarderInterface.getFunction('execute');
   if(DEBUG) console.log("Relay forwarderData:", forwarderData);
/*
    const requestForwarder = {
    from,
    to: REACT_APP_FORWARDER_ADDRESS,
    value: '0',
    gas: ethers.BigNumber.from(1000000).toHexString(),
    nonce,
    data
  };

  if(DEBUG) console.log("Relay4:", requestForwarder );
  //const result = await provider.send('eth_sendTransaction', ...requestForwarder );
  //const result = await forwarder.execute(...args);
  //if(DEBUG) console.log("Relay 5:", result);
  //const verifyResult = await forwarder.verify(...args);
  //if(DEBUG) console.log("Relay 5:", verifyResult);


*/
  // Send request to the server
  const response = await fetch(RelayUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, signature })
  }).then(r => r.json());

  return response;
}
