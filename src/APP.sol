// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract User {
    //平台用戶
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

    function getAddr() public view returns (address) {
        return addr;
    }

    function getName() public view returns (string memory) {
        return name;
    }
    // function addProject()
}

contract Project {
    address owner;
    address[] memberArray;
    string projectName;
    uint timestamp;
    mapping(address => string[]) ipfsMap; //confirm
    string[] ipfsWaitingArray; //not confirm
    address[] memberWaitingArray;

    // mapping(string => address) ipfsWaitingAddr;

    constructor(address _addr, string memory _projectName) payable {
        owner = _addr;
        projectName = _projectName;
        timestamp = block.timestamp;
        memberArray.push(_addr);
    }

    // function addMember(User _user) public isOwner{
    //     memberArray.push(_user);
    // }

    // function requestAddMember(User _user) public {
    //     memberWaitingArray.push(_user);
    // }

    function sendHash(string memory _ipfsHash) public {
        //成員上傳未審核ipfs給owner
        uint index = checkWaitingArray(_ipfsHash);
        if (index == 0) ipfsWaitingArray.push(_ipfsHash);
    }

    function pushHash(address _addr, string memory _ipfsHash) public {
        //ipfs上鏈 onlyOwner
        uint index = checkWaitingArray(_ipfsHash);
        require(index != 0, "ipfs hash not in waiting array");
        index--;
        ipfsMap[_addr].push(_ipfsHash);
        ipfsWaitingArray[index] = ipfsWaitingArray[ipfsWaitingArray.length - 1];
        ipfsWaitingArray.pop();
    }

    function checkWaitingArray(
        string memory _ipfsHash
    ) public view returns (uint) {
        //回傳未審核ipfs index, 0 = 沒上傳
        for (uint i = 0; i < ipfsWaitingArray.length; ++i)
            if (
                keccak256(abi.encodePacked(ipfsWaitingArray[i])) ==
                keccak256(abi.encodePacked(_ipfsHash))
            ) return i + 1;
        return 0;
    }

    function getipfsMap(address _addr) public view returns (string[] memory) {
        //取得成員審核過的ipfs
        return ipfsMap[_addr];
    }

    function getipfsWaitingArray() public view returns (string[] memory) {
        //owner取得未審核ipfs
        return ipfsWaitingArray;
    }

    function getMemberArray() public view returns (address[] memory) {
        return memberArray;
    }
}

contract Platform {
    //平台功能
    mapping(address => User) userMap;
    mapping(address => Project[]) projectMap;
    mapping(Project => address) projectOwnerMap;
    User[] userArray;
    event currency(uint _value);
    event addr(address _addr);
    modifier onlyUser() {
        bool b = true;
        for (uint i = 0; i < userArray.length; i++)
            if (userArray[i].getAddr() == msg.sender) b = false;
        if (b) revert("Please sign up");
        _;
    }

    function register(string memory _name) public {
        for (uint i = 0; i < userArray.length; i++)
            require(
                userArray[i].getAddr() != msg.sender,
                "you have already registered"
            );
        User u = new User(msg.sender, _name);
        userMap[msg.sender] = u;
        userArray.push(u);
    }

    function createAndSendEther(
        string memory _projectName
    ) public payable onlyUser {
        if (msg.value >= 1 ether) {
            emit currency(msg.value);
            Project p = new Project{value: msg.value}(msg.sender, _projectName);
            projectMap[msg.sender].push(p);
            projectOwnerMap[p] = msg.sender;
        } else {
            payable(msg.sender).transfer(msg.value);
            revert("you need to pay more than 1 ether");
        }
    }

    function mappingUser(address _addr) public view returns (User user) {
        user = userMap[_addr];
    }

    function mappingProject(
        address _addr
    ) public view returns (Project[] memory) {
        return projectMap[_addr];
    }

    function sendHash(uint _idx, string memory _ipfsHash) public onlyUser {
        Project p = projectMap[msg.sender][_idx];
        p.sendHash(_ipfsHash);
    }

    function pushHash(
        uint _idx,
        address _addr,
        string memory _ipfsHash
    ) public onlyUser {
        Project p = projectMap[msg.sender][_idx];
        require(projectOwnerMap[p] == msg.sender, "you are not project owner");
        p.pushHash(_addr, _ipfsHash);
    }

    // function addMember(address _user, address _project) public {
    //     User user = mappingUser(_user);
    // }

    // function requestAddMember(address _user, address _project) public isUser{
    //     User user = mappingUser(_user);
    // }
}
