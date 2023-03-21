import { useEffect, useState } from 'react'
import { create as ipfsHttpClient } from "ipfs-http-client";
import './App.css';
import { ethers } from "ethers";
import { Button, Paper, Stack, Typography, TextField } from "@mui/material";

const Web3 = require('web3');
const projectId = "2MoNPMhJJ3TOtkAXUd6QCWGLwIZ"
const projectSecretKey = "48c6e8cc41d4f613efc9538488670302"
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
const ipfs = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization
  }
})
const web3 = new Web3("http://140.115.52.52:8545")
let contract = new web3.eth.Contract(
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
], "0xf113aD08033F7DfFdAc07EA0E0e307BBf49d2066"
)
// const account1 = '0xa508dD875f10C33C52a8abb20E16fc68E981F186'
// const account2 = '0xd4039eB67CBB36429Ad9DD30187B94f6A5122215'

function App() {//------------------------------------------------------------

  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [userName, setUserName] = useState(null);
  const [projectAddress, setProjectAddress] = useState(null);
  const [ipfsHash, setipfsHash] = useState(null);
  const [memberAddress, setMemberAddress] = useState(null);
  const [newProject, setNewProject] = useState(null);
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accountsChanged);
      window.ethereum.on("chainChanged", chainChanged);
    }
  }, []);

  const registerChange = async (event) => {
    setUserName(event.target.value);
  }

  const registerHandler = async () => {//註冊按鈕
    try {
      contract.methods.register(userName).send({
        from: account,
        gas: 1500000
      }).then(console.log);
    } catch (err) {
      console.log(err);
    }
  }

  const createProjectHandler = async () => {//發起專案按鈕
    try {
      contract.methods.createAndSendEther("testProject").send({
        from: account,
        gas: 1500000,
        value: 1000000000000000000//1 ether = 10^18 wei
      }).then(
        (txHash) => console.log(txHash),
        // contract.methods.getNewProject().call({
        //   from: account,
        //   gas: 1500000
        // }).then(
        //   (txHash) => 
        //   console.log(txHash)
        //   ) 
        );
    } catch (err) {
      console.log(err);
      setErrorMessage("There was a problem creating project");
    }
  }

  const connectHandler = async () => {//連接Metamask按鈕
    if (window.ethereum) {
      try {
        const res = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        await accountsChanged(res[0]);
      } catch (err) {
        console.error(err);
        setErrorMessage("There was a problem connecting to MetaMask");
      }
    } else {
      setErrorMessage("Install MetaMask");
    }
  };

  const accountsChanged = async (newAccount) => {//Metamask變更帳號
    setAccount(newAccount);
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [newAccount.toString(), "latest"],
      });
      setBalance(ethers.utils.formatEther(balance));

    } catch (err) {
      console.error(err);
      setErrorMessage("There was a problem connecting to MetaMask");
    }
  };

  const chainChanged = () => {//Metamask換鏈
    setErrorMessage(null);
    setAccount(null);
    setBalance(null);
  };

  const onSubmitHandler = async (event) => {//檔案上傳IPFS, 請求上鏈
    event.preventDefault();
    const form = event.target;
    const files = (form[0]).files;
    if (!files || files.length === 0) {
      return alert("No files selected");
    }
    const file = files[0];
    const result = await ipfs.add(file);
    console.log(result.path);
    console.log(projectAddress);
    contract.methods.sendHash(projectAddress, result.path).send({
      from: account,
      gas: 1500000
    }).then(console.log);
    setImages([
      ...images,
      {
        cid: result.cid,
        path: result.path,
      },
    ]);

    form.reset();
  };

  const projectAddressChange = async (event) => {
    setProjectAddress(event.target.value);
  }

  const ipfsHashChange = async (event) => {
    setipfsHash(event.target.value);
  }

  const pushHashHandler = async () => {//ipfs上鏈
    try {
      contract.methods.pushHash(projectAddress, memberAddress, ipfsHash).send({
        from: account,
        gas: 1500000
      }).then(console.log);
    } catch (err) {
      console.log(err);
    }
  }

  const memberAddressChange = async (event) => {
    setMemberAddress(event.target.value);
  }

  const requestMemberHandler = async (event) => {
    try {
      contract.methods.requestMember(projectAddress).send({
        from: account,
        gas: 1500000
      }).then(console.log);
    } catch (err) {
      console.log(err);
    }
  }

  const addMemberHandler = async (event) => {
    try {
      contract.methods.addMember(memberAddress, projectAddress).send({
        from: account,
        gas: 1500000
      }).then(console.log);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="App">
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6"> Account: {account} </Typography>
            <Typography variant="h6">
              Balance: {balance} {balance ? "ETH" : null}
            </Typography>
            <Button variant="contained" onClick={connectHandler}>Connect Account</Button>

            <TextField label="User Name" onChange={registerChange} />
            <Button variant="contained" onClick={registerHandler}>Register</Button>
            {errorMessage ? (
              <Typography variant="body1" color="red">
                Error: {errorMessage}
              </Typography>
            ) : null}

          </Stack>
        </Paper>
      </div>
      <br />
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Button variant="contained" onClick={createProjectHandler}>發起專案</Button>
            <Typography variant="h6">New Project: {newProject} </Typography>
            <TextField label="Project Address" onChange={projectAddressChange} />
            {ipfs && (
              <>
                <h3>Upload file to IPFS</h3>
                <form onSubmit={onSubmitHandler}>
                  <input type="file" name="file" />
                  <button type="submit">Upload file to IPFS & Send Hash</button>
                </form>
              </>
            )}
            <div>
              {images.map((image, index) => (
                <img
                  alt={`Uploaded #${index + 1}`}
                  src={"https://skywalker.infura-ipfs.io/ipfs/" + image.path}
                  style={{ maxWidth: "400px", margin: "15px" }}
                  key={image.cid.toString() + index}
                />
              ))}
            </div>
          </Stack>
        </Paper>
      </div>
      <br />
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <h3>For Owner</h3>
            <TextField label="Member Address" onChange={memberAddressChange} />
            <TextField label="IPFS Hash" onChange={ipfsHashChange} />
            <Button variant="contained" onClick={pushHashHandler}>push Hash</Button>
            <TextField label="User Address" onChange={memberAddressChange} />
            <Button variant="contained" onClick={addMemberHandler}>Add Member</Button>
          </Stack>
        </Paper>
      </div>
      <br />
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <h3>For Member</h3>
            <Button variant="contained" onClick={requestMemberHandler}>requset member</Button>
          </Stack>
        </Paper>
      </div>
    </div>

  )
}

export default App