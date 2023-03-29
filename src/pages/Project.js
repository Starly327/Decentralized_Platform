import { useEffect, useState } from 'react'
import { Button, Paper, Stack, Typography, TextField } from "@mui/material";
import { contract } from './Contract';
import { ipfs } from './IPFS';
import { Account } from './Account'; 


const Project = () => {
    const [images, setImages] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [userName, setUserName] = useState(null);
    const [projectAddress, setProjectAddress] = useState(null);
    const [ipfsHash, setipfsHash] = useState(null);
    const [memberAddress, setMemberAddress] = useState(null);
    const [newProject, setNewProject] = useState(null);
    
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

    return (
        <div className="bg Project">
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
    );
};

export default Project;