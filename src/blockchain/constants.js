

export const NETWORKS = {
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
    blockExplorer: "https://etherscan.io/",
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
  },
  matic: {
    name: "Polygon",
    color: "#2bbdf7",
    chainId: 137,
    blockExplorer: "https://polygonscan.com/",
    token: "MATIC",
    rpcUrlMetaMask: "https://matic-mainnet.chainstacklabs.com"
  },
  mumbai: {
    name: "Polygon Testnet Mumbai",
    color: "#92D9FA",
    chainId: 80001,
    faucet: "https://faucet.polygon.technology/",
    blockExplorer: "https://mumbai.polygonscan.com/",
    token: "tMATIC",
    rpcUrlMetaMask: "https://matic-mumbai.chainstacklabs.com"
  },
};


