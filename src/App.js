import { useEffect, useState } from 'react'
import { create as ipfsHttpClient } from "ipfs-http-client";
import './App.css';
import { ethers } from "ethers";
import { Button, Paper, Stack, Typography } from "@mui/material";

const Web3 = require('web3');
// insert your infura project crediental you can find 
// easily these your infura account in API key management section
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
        "inputs": [],
        "name": "getHash",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "x",
                "type": "string"
            }
        ],
        "name": "sendHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
], "0x94A185f415a986aeF85a79029f5d1bEeE1a9ED1d"
)
const account1 = '0xa508dD875f10C33C52a8abb20E16fc68E981F186'
const account2 = '0xd4039eB67CBB36429Ad9DD30187B94f6A5122215'
function App() {
  const [images, setImages] = useState([])
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = (form[0]).files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    const result = await ipfs.add(file);
    // console.log(result);
    contract.methods.sendHash(result.path).send(
      {from: account1}
    ).then(value =>{
      console.log(value)
      contract.methods.getHash().call().then(console.log)    
  })
    setImages([
      ...images,
      {
        cid: result.cid,
        path: result.path,
      },
    ]);

    form.reset();
  };

  return (
    <div className="App">
      {ipfs && (
        <>
          <h3>Upload file to IPFS</h3>
          <form onSubmit={onSubmitHandler}>
            <input type="file" name="file" />
            <button type="submit">Upload file</button>
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
    </div>
    
  )
}

export default App