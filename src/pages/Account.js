import { useEffect, useState, useSyncExternalStore } from 'react'
import { ethers } from "ethers";
import {
  Button, Paper, Stack, Typography, TextField, FormControl, Select, MenuItem, Alert, InputLabel
  , Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box
} from "@mui/material";
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

  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData('創作Demo_v1', 'QmapZrcxBLC3qeWD5AM1LqpyHcK1uRJmrUNsP9W5uNN31c', '0xa508dD875f10C33C52a8abb20E16fc68E981F186', '2023-06-02T07:06:14.231Z', 4.0),
    createData('創作Demo_v2', 'QmTmkeKveLukwLLCeAevDUb1trGEibqudji3AUKrmFFFD8', '0xa508dD875f10C33C52a8abb20E16fc68E981F186', '2023-06-02T07:07:25.558Z', 4.3),
    createData('創作Demo_v3', 'QmRDA5xSw1FZWYhc9JaXA4NsafVN2seHCZZeYv68DJxRbP', '0xd4039eB67CBB36429Ad9DD30187B94f6A5122215', '2023-06-03T07:10:15.799Z', 6.0),
    createData('創作Demo_v4', 'QmQ5FgqtKsymukFu8bCj6tem8kBpnzxrYvK591pn8CRWQr', '0x7633Fe8542c2218B5A25777477F63D395aA5aFB4', '2023-06-03T08:06:18.231Z', 4.3),
    createData('創作Demo_v5', 'QmXYQdjG2xHmRZbLDAoDQFmBmCiyXQSEdTX1ZPNqgwADFo', '0xd4039eB67CBB36429Ad9DD30187B94f6A5122215', '2023-06-03T08:20:16.242Z', 3.9),
  ];

  return (
    <div className="Account">
      <div>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <h3>使用者註冊平台</h3>
            <Typography variant="h7"> Account: {account} </Typography>
            <Typography variant="h7"> Balance: {balance} {balance ? "ETH" : null} </Typography>
            <Button variant="contained" onClick={connectHandler}>連結以太坊帳戶</Button>

            <TextField label="使用者名稱" onChange={registerChange} />
            <TextField id="outlined-multiline-static" label="個人簡介" multiline rows={3} />
            <TextField id="outlined-multiline-static" label="社群、作品連結" multiline rows={3} />
            <TextField id="outlined-multiline-static" label="聯絡資訊" multiline rows={3} />
            <Button variant="contained" onClick={registerHandler}>申請註冊</Button>
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
            <h3>發起協作專案</h3>
            <TextField label="專案名稱" />
            <TextField id="outlined-multiline-static" label="目的詳述" multiline rows={3} />
            <TextField id="outlined-multiline-static" label="需求人才" multiline rows={3} />
            <TextField id="outlined-multiline-static" label="資金規劃" multiline rows={3} />
            <Alert severity="info">平台會向您收取一筆"發行專案手續費"</Alert>
            <Button variant="contained" color="secondary" onClick={createProjectHandler}>發起專案</Button>
            <h4>選擇現有專案</h4>
            <FormControl fullWidth>
              <InputLabel id="selectContractLabel">Contract Address</InputLabel>
              <Select value={projectAddress} onChange={projectAddressChange} labelId="selectContractLabel">
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            <h4>創作貢獻審核</h4>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>創作項目</TableCell>
                    <TableCell align="right">IPFS地址</TableCell>
                    <TableCell align="right">申請成員</TableCell>
                    <TableCell align="right">申請時間</TableCell>
                    <TableCell align="right">審核結果</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.calories}</TableCell>
                      <TableCell align="right">{row.fat}</TableCell>
                      <TableCell align="right">{row.carbs}</TableCell>
                      <TableCell align="right">{row.protein}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            <h3>專案成員互評</h3>
            <FormControl fullWidth>
              <InputLabel id="selectMemberLabel">專案成員</InputLabel>
              <Select value={projectAddress} onChange={projectAddressChange} labelId="selectMemberLabel">
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">評價分數</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField id="outlined-multiline-static" label="根據協作過程對成員作出評價，讓其他使用者有更客觀的參考依據" multiline rows={3} />
            <Button type="submit" variant="contained" color="secondary">送出評價</Button>
            <h3>申請新增創作貢獻</h3>
            <TextField label="創作標題" />
            <FormControl fullWidth>
              <InputLabel id="selectMemberLabel">創作成員</InputLabel>
              <Select value={projectAddress} onChange={projectAddressChange} labelId="selectMemberLabel">
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {ipfs && (
              <>
                <form onSubmit={onSubmitHandler}>
                  <input type="file" name="file" />
                  <Button type="submit" variant="contained" color="secondary">送出申請</Button>
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