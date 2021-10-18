/* Api methods to call /functions */

const DEBUG = true;

const add = (address, amount, description) => {
  const data = {"address": address, "amount": amount, "description": description };
  if(DEBUG) console.log("add api: ", data);
  return fetch('/api/add-background', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response;
  })
}

const sell = (tokenId, sellData) => {
  const data = {"tokenId": tokenId, "data": sellData };
  if(DEBUG) console.log("sell api: ", data);
  return fetch('/api/sell', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const unlockable = (tokenId, address) => {
  const data = {"tokenId": tokenId, "address": address };
  if(DEBUG) console.log("unlockable api: ", data);
  return fetch('/api/unlockable-background', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response;
  })
}


const encrypt = (toEncrypt, key) => {
  const data = {"data": toEncrypt, "key": key };
  if(DEBUG) console.log("encrypt api: ", data);
  return fetch('/api/encrypt', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}




const getToken = (tokenId, force = false, contract = "80001.0x49368C4ED51BE6484705F07B63eBD92270923081") => {
  if(DEBUG) console.log("getToken api: tokenId: ", tokenId, "force: ", force);
  //const strForce = (force)?"true":"false";
  const data = {"tokenId": tokenId, "force": force, "contract": contract};
  return fetch('/api/gettoken', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}


const hello = (txRequest) => {
  if(DEBUG) console.log("hello api: txRequest: ", txRequest);

  return fetch('/api/hello', {
    body: JSON.stringify(txRequest),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const txSent = (txData, chainId) => {
  const data = {"txData": txData, "chainId": chainId};
  if(DEBUG) console.log("txSent api: ", data);
  if( txData === undefined || txData === 0) return "txSent error - wrong hash";
  return fetch('/api/tx-background', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    if(DEBUG) console.log("txSent api response: ", response);
    return response;
  })
}

const getCollection = (set, address = 0, search = "", limit = 100, contract = "80001.0x49368C4ED51BE6484705F07B63eBD92270923081") => {
  const data = {"set": set, "address": address, "search": "", "limit": limit, "contract": contract};
  if(DEBUG) console.log("getCollection api: ", data);
  return fetch('/api/getcollection', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json();
  })
};

export default {
  getToken: getToken,
  txSent: txSent,
  getCollection: getCollection,
  hello: hello,
  sell: sell,
  encrypt: encrypt,
  add: add,
  unlockable: unlockable
}
