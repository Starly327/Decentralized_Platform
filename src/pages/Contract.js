const Web3 = require('web3');
const web3 = new Web3("http://140.115.52.52:8545")
export const contract = new web3.eth.Contract(
    [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "currency",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "contract Project",
                    "name": "_addr",
                    "type": "address"
                }
            ],
            "name": "pro",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_addr",
                    "type": "address"
                },
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "addMember",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "checkProjectRole",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_projectName",
                    "type": "string"
                }
            ],
            "name": "createAndSendEther",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "getMemberArray",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "getMemberWaitingArray",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "getipfsWaitingArray",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_addr",
                    "type": "address"
                }
            ],
            "name": "mappingProject",
            "outputs": [
                {
                    "internalType": "contract Project[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_addr",
                    "type": "address"
                }
            ],
            "name": "mappingUser",
            "outputs": [
                {
                    "internalType": "contract User",
                    "name": "user",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_addr",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_ipfsHash",
                    "type": "string"
                }
            ],
            "name": "pushHash",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                }
            ],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                }
            ],
            "name": "requestMember",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract Project",
                    "name": "_project",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_ipfsHash",
                    "type": "string"
                }
            ],
            "name": "sendHash",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], "0xa799b4b9e50031485A4aFb7bA80b251168138831"
)