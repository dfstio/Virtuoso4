/* Api methods to call /functions */

const DEBUG = true;

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
}

export default {
  getToken: getToken,
  txSent: txSent,
  getCollection: getCollection,
  hello: hello
}