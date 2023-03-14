// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract User{//平台用戶
    address addr;
    string name;
    // uint gender;
    // uint weight;
    uint timestamp;
    Project[] project;
    constructor(address _addr, string memory _name) {
        addr = _addr;
        name = _name;
        timestamp = block.timestamp;
    }
    function getAddr() public view returns(address){
        return addr;
    }

    function getName() public view returns(string memory){
        return name;
    }
    // function addProject()
}

contract Project {//專案
    User owner;
    User[] memberArray;
    string projectName;
    uint timestamp;
    address contractAddr;
    mapping(User => string[]) ipfsMap;//confirm
    string[] ipfsWaitingArray;//not confirm
    User[] memberWaitingArray;
    // mapping(string => address) ipfsWaitingAddr;

    constructor(User _user, string memory _projectName) payable {
        timestamp = block.timestamp;
        contractAddr = address(this);
        owner = _user;
        projectName = _projectName;
        memberArray.push(_user);
    }

    modifier isOwner() {
        require(msg.sender == owner.getAddr(), "Caller is not owner");
        _;
    }

    modifier onlyMember() {
        bool b = true;
        for (uint i = 0; i < memberArray.length; i++)
            if (memberArray[i].getAddr() == msg.sender)
                b = false;
        if (b)
            revert("you are not project member");
        _;
    }

    // function addMember(User _user) public isOwner{
    //     memberArray.push(_user);
    // }

    // function requestAddMember(User _user) public {
    //     memberWaitingArray.push(_user);
    // }

    function sendHash(string memory _ipfsHash) public onlyMember {//成員上傳未審核ipfs給owner
        uint index = checkWaitingArray(_ipfsHash);
        if(index==0) ipfsWaitingArray.push(_ipfsHash);
    }

    function pushHash(User _user, string memory _ipfsHash) public isOwner {//ipfs上鏈
        uint index = checkWaitingArray(_ipfsHash);
        if(index!=0){
            index--;
            ipfsMap[_user].push(_ipfsHash);
            ipfsWaitingArray[index] = ipfsWaitingArray[ipfsWaitingArray.length - 1];
            ipfsWaitingArray.pop();
        }
    }

    function checkWaitingArray(string memory _ipfsHash) public view returns (uint){//回傳未審核ipfs index, 0 = 沒上傳
        for(uint i = 0; i < ipfsWaitingArray.length; ++i)
            if(keccak256(abi.encodePacked(ipfsWaitingArray[i]))==keccak256(abi.encodePacked(_ipfsHash))) return i+1;
        return 0;
    }

    function getipfsMap(User _user) public view returns(string[] memory){//取得成員審核過的ipfs
        return ipfsMap[_user];
    }

    function getipfsWaitingArray() public view isOwner returns(string[] memory){//owner取得未審核ipfs
        return ipfsWaitingArray;
    }
   
    function getContractAddress() public view returns (address) {
        return contractAddr;
    }

    function getProjectName() public view returns (string memory) {
        return projectName;
    }

    function getMemberArray() public view returns (User[] memory) {
        return memberArray;
    }
}



contract Platform {//平台功能
    
    mapping(address => User) userMap;
    Project[] projectArray;
    User[] userArray;
    event currency(uint value);

    modifier onlyUser() {
        bool b = true;
        for (uint i = 0; i < userArray.length; i++)
            if (userArray[i].getAddr() == msg.sender)
                b = false;
        if (b)
            revert("Please sign up");
        _;
    }

    constructor() payable {}

    function register(string memory _name) public {
        for(uint i = 0; i < userArray.length; i++)
            require(userArray[i].getAddr() != msg.sender, "you have already registered");
        User u = new User(msg.sender, _name);
        userMap[msg.sender] = u;
        userArray.push(u);
    }

    function createAndSendEther(string memory _projectName) public payable onlyUser{
        if(msg.value > 1 ether){
            Project p = new Project{value: msg.value}(userMap[msg.sender], _projectName);
            projectArray.push(p);
            emit currency(msg.value);
        }else{
            payable(msg.sender).transfer(msg.value);
        } 
    }

    // function addMember(address _user, address _project) public {
    //     User user = mappingUser(_user);
    // }

    // function requestAddMember(address _user, address _project) public isUser{
    //     User user = mappingUser(_user);
    // }

    function mappingUser(address _addr) public view returns(User user){
        user = userMap[_addr];
    }

    function test() public view returns(Project[]  memory) {
        // User u = users[_addr];
        // name = u.getName();
        // addr = users[_addr].getAddr();
        return projectArray;
    }
}