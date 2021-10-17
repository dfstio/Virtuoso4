// Server-side code for receiving meta-tx requests
// The server validates the request, and if accepted, will send the meta-tx via a Defender Relayer
const DEBUG = true;
const {  RELAY_KEY, RELAY_SECRET, REACT_APP_FORWARDER_ADDRESS, CHAIN_ID, RPC_URL, MODERATOR_KEY} = process.env;


const { Relayer } = require('defender-relay-client');
const { ethers } = require('ethers');
const ForwarderAbi = require('../relay/IForwarder.json');

const { TypedDataUtils } = require('eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');

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
];

const TypedData = {
  domain: {
    name: 'NFT Virtuoso', //'GSN Relayed Transaction',
    version: '1', //'2',
    chainId: 80001,
    verifyingContract: REACT_APP_FORWARDER_ADDRESS
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

async function relay(request) {
  // Unpack request
  if(DEBUG) console.log("Relay request:", request);
  const { to, from, value, gas, nonce, data, signature } = request;

  // Validate request

  const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
  //const wallet = new ethers.Wallet(MODERATOR_KEY);
  //const signer = wallet.connect(provider);
  const forwarder = new ethers.Contract(REACT_APP_FORWARDER_ADDRESS, ForwarderAbi, provider);
  //if(DEBUG) console.log("Relay forwarder 2:", forwarder);

  const args = [
    { to, from, value, gas, nonce, data, validUntil: "0x0"  },
    DomainSeparator,
    TypeHash,
    SuffixData,
    signature
  ];

  //if(DEBUG) console.log("Relay forwarder 3:", args);
  const verifyResult = await forwarder.verify(...args);
  //if(DEBUG) console.log("Relay forwarder 4:", verifyResult);

  // Send meta-tx through Defender
  //const forwardData = forwarder.interface.encodeFunctionData('execute', args);
  const forwarderInterface = new ethers.utils.Interface(ForwarderAbi);
  const forwardData = forwarderInterface.encodeFunctionData('execute', args);
  //if(DEBUG) console.log("Relay forwarder 5:", forwardData);
  //if(DEBUG) console.log("Relay forwarder 6:", RELAY_KEY, RELAY_SECRET);
  const relayer = new Relayer({apiKey: RELAY_KEY, apiSecret: RELAY_SECRET});
  const tx = await relayer.sendTransaction({
    speed: 'fast',
    to: REACT_APP_FORWARDER_ADDRESS,
    gasLimit: 1e6,
    data: forwardData,
  });

  console.log(`Sent meta-tx: ${tx.hash}`);
  return tx;
}

// Handler for lambda function
exports.handler = async function(event, context, callback) {
  try {

    const data = JSON.parse(event.body);
    //if(DEBUG) console.log("Relay function:", data);
    const response = await relay(data);
    callback(null, { statusCode: 200, body: JSON.stringify(response) });
  } catch (err) {
    callback(err);
  }
}