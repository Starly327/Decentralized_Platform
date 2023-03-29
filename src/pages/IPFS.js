import { create as ipfsHttpClient } from "ipfs-http-client";

const projectId = "2MoNPMhJJ3TOtkAXUd6QCWGLwIZ"
const projectSecretKey = "48c6e8cc41d4f613efc9538488670302"
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
export const ipfs = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization
  }
})