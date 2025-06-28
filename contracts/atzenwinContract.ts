export const ATZENWIN_CONTRACT_ADDRESS = '0xA5bc7d4ef9667EDDac175a30f0BEB8ea61bd46cC';

export const ATZENWIN_CONTRACT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "getPoints",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_points", "type": "uint256"}
    ],
    "name": "transferPoints",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_points", "type": "uint256"}
    ],
    "name": "addPoints",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
