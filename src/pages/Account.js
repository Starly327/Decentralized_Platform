import { useEffect, useState, useSyncExternalStore } from 'react'
import { ethers } from "ethers";
import { Button, Paper, Stack, Typography, TextField, FormControl, Select, MenuItem } from "@mui/material";
import { contract } from './Contract';
import { ipfs } from './IPFS';

// const account1 = '0xa508dD875f10C33C52a8abb20E16fc68E981F186'
// const account2 = '0xd4039eB67CBB36429Ad9DD30187B94f6A5122215'

function Account() {//------------------------------------------------------------

  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [userName, setUserName] = useState(null);
  const [projectAddress, setProjectAddress] = useState("");
  const [ipfsHash, setipfsHash] = useState(null);
  const [memberAddress, setMemberAddress] = useState(null);
  const [options, setOptions] = useState([]);
  const [ipfsWaitingList, setipfsWaitingList] = useState([]);
  const [memberWaitingList, setMemberWaitingList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [projectRole, setProjectRole] = useState("");

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

  const createProjectHandler = () => {//發起專案按鈕
    try {
      contract.methods.createAndSendEther("testProject").send({
        from: account,
        gas: 3000000,
        value: 1000000000000000000//1 ether = 10^18 wei
      }).then(
        (txHash) => console.log(txHash)
      );
      newProjectChange(account);
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
        await newProjectChange(res[0]);
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
    alert(result.path);
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

  const ipfsHashChange = async (event) => {
    setipfsHash(event.target.value);
  }

  const pushHashHandler = async () => {//ipfs上鏈
    try {
      contract.methods.pushHash(projectAddress, memberAddress, ipfsHash).send({
        from: account,
        gas: 1500000
      }).then(alert("push!!!"));
    } catch (err) {
      console.log(err);
    }
  }

  const memberAddressChange = async (event) => {
    setMemberAddress(event.target.value);
  }

  const requestMemberHandler = () => {//請求加入專案功能
    try {
      contract.methods.requestMember(projectAddress).send({
        from: account,
        gas: 1500000
      }).then(console.log);
    } catch (err) {
      console.log(err);
    }
  }

  const addMemberHandler = async () => {//加入成員
    try {
      contract.methods.addMember(memberAddress, projectAddress).send({
        from: account,
        gas: 1500000
      }).then(alert("add Member!!!"));
    } catch (err) {
      console.log(err);
    }
  }

  const newProjectChange = (_account) => {//加入新專案
    contract.methods.mappingProject(_account).call({
      from: account,
      gas: 1500000
    }).then((newOption) => {
      setOptions(newOption);
    })
  }

  const projectAddressChange = async (event) => {//切換專案
    setProjectAddress(event.target.value);
    checkProjectRole(event.target.value);
  }

  const ipfsWaitingHandler = () => {//取得未審核ipfs
    contract.methods.getipfsWaitingArray(projectAddress).call({
      from: account,
      gas: 1500000
    }).then((list) => {
      setipfsWaitingList(list);
    })
  }

  const memberWaitingHandler = () => {//取得未審核成員
    contract.methods.getMemberWaitingArray(projectAddress).call({
      from: account,
      gas: 1500000
    }).then((list) => {
      setMemberWaitingList(list);
    })
  }

  const checkMmeberHandler = () => {//查看專案成員
    contract.methods.getMemberArray(projectAddress).call({
      from: account,
      gas: 1500000
    }).then((list) => {
      setMemberList(list);
    })
  }

  const checkProjectRole = (_project) => {
    contract.methods.checkProjectRole(_project).call({
      from: account,
      gas: 1500000
    }).then((b) => {
      if (b)
        setProjectRole("Owner");
      else
        setProjectRole("Member");
    })
  }

  return (
    <div className="Account">
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6"> Account: {account} </Typography>
            <Typography variant="h6">
              Balance: {balance} {balance ? "ETH" : null}
            </Typography>
            <Button variant="contained" onClick={connectHandler}>Connect Account</Button>
            <h3>平台註冊</h3>
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
            <Button variant="contained" color="secondary" onClick={createProjectHandler}>發起專案</Button>
            <h4>選擇有加入的專案</h4>
            <Select value={projectAddress} onChange={projectAddressChange}>
              {options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <h4>{projectRole}</h4>
          </Stack>
        </Paper>
      </div>
      <br />
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <h3>[專案負責人功能]</h3>
            <Button variant="contained" color="success" onClick={memberWaitingHandler}>查看申請加入成員名單</Button>
            {memberWaitingList.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
            <h4>新增專案合夥人</h4>
            <TextField label="User Address" onChange={memberAddressChange} />
            <Button variant="contained" color="success" onClick={addMemberHandler}>Add Member</Button>
            <Button variant="contained" onClick={ipfsWaitingHandler}>查看IPFS未審核名單</Button>
            {ipfsWaitingList.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
            <h4>IPFS上鏈</h4>
            <TextField label="Member Address" onChange={memberAddressChange} />
            <TextField label="IPFS Hash" onChange={ipfsHashChange} />
            <Button variant="contained" onClick={pushHashHandler}>push Hash</Button>
          </Stack>
        </Paper>
      </div>
      <br />
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <h3>[專案合夥人功能]</h3>
            <Button variant="contained" color="secondary" onClick={checkMmeberHandler}>專案成員</Button>
            {memberList.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
            {ipfs && (
              <>
                <h4>上傳IPFS</h4>
                <form onSubmit={onSubmitHandler}>
                  <input type="file" name="file" />
                  <Button type="submit" variant="contained" color="secondary">Upload file to IPFS & Send Hash</Button>
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
            <h3>[平台用戶功能]</h3>
            <h4>請求加入專案</h4>
            <TextField label="Project Address" onChange={projectAddressChange} />
            <Button variant="contained" color="success">
              請求加入專案成員
            </Button>
          </Stack>
        </Paper>
      </div>
    </div>

  )
}

export default Account