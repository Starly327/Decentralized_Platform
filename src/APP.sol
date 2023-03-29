// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract User {
    //平台用戶
    address addr;
    string name;
    uint hub;
    uint authority;
    Project[] projectArray;

    constructor(address _addr, string memory _name) {
        addr = _addr;
        name = _name;
        hub = 1;
        authority = 1;
    }

    function addProject(address _addr, Project _project) public {
        require(addr == _addr, "you are not user");
        projectArray.push(_project);
    }

    function addHub(uint _auth) public {
        hub += _auth;
    }

    function addAuth(uint _hub) public {
        authority += _hub;
    }

    function getHub() public view returns (uint) {
        return hub;
    }

    function getAuth() public view returns (uint) {
        return authority;
    }

    function getAddr() public view returns (address) {
        return addr;
    }

    function getName() public view returns (string memory) {
        return name;
    }
}

//-----------------------------------------------------------------------------
contract Project {
    address owner;
    string projectName;
    uint timestamp;
    mapping(address => string[]) ipfsMap; //confirm
    string[] ipfsArray; //confirm
    string[] ipfsWaitingArray; //not confirm
    address[] memberArray; //confirm
    address[] memberWaitingArray; //not confirm
    User[][] scoreArray;
    User[] temp;
    event value(uint i);

    constructor(address _addr, string memory _projectName) payable {
        owner = _addr;
        projectName = _projectName;
        timestamp = block.timestamp;
        memberArray.push(_addr);
    }

    function onlyMember(address _addr) internal view returns (bool b) {
        b = true;
        for (uint i = 0; i < memberArray.length; i++)
            if (memberArray[i] == _addr) b = false;
        if (b) revert("not project member");
    }

    function scoreMember(User _from, User _to) public {
        //onlyMember
        onlyMember(_from.getAddr());
        onlyMember(_to.getAddr());
        temp.push(_from);
        temp.push(_to);
        for (uint i = 0; i < scoreArray.length; ++i)
            if (
                keccak256(abi.encodePacked(scoreArray[i])) ==
                keccak256(abi.encodePacked(temp))
            ) revert("already scored");

        scoreArray.push(temp);
        temp.pop();
        temp.pop();
    }

    function requestMember(address _addr) public {
        uint index = checkMemberWaitingArray(_addr);
        require(index == 0, "user already in waiting array");
        for (uint i = 0; i < memberArray.length; ++i)
            if (memberArray[i] == _addr) revert("you are project member");
        memberWaitingArray.push(_addr);
    }

    function addMember(address _addr) public {
        //onlyOmwer
        uint index = checkMemberWaitingArray(_addr);
        require(index != 0, "user not in waiting array");
        index--;
        memberArray.push(_addr);
        User a = Platform(msg.sender).mappingUser(_addr);
        User h = Platform(msg.sender).mappingUser(owner);
        uint tempHub = h.getHub();
        h.addHub(a.getAuth());
        a.addAuth(tempHub);
        memberWaitingArray[index] = memberWaitingArray[
            memberWaitingArray.length - 1
        ];
        memberWaitingArray.pop();
    }

    function checkMemberWaitingArray(
        address _addr
    ) internal view returns (uint) {
        for (uint i = 0; i < memberWaitingArray.length; ++i) {
            if (memberWaitingArray[i] == _addr) return i + 1;
        }
        return 0;
    }

    function sendHash(address _addr, string memory _ipfsHash) public {
        //onlyMember
        bool b = onlyMember(_addr);
        if (!b) {
            uint index = checkipfsWaitingArray(_ipfsHash);
            require(index == 0, "ipfs hash already in waiting array");
            for (uint i = 0; i < ipfsArray.length; ++i)
                if (
                    keccak256(abi.encodePacked(ipfsArray[i])) ==
                    keccak256(abi.encodePacked(_ipfsHash))
                ) revert("ipfs hash already in array");
            ipfsWaitingArray.push(_ipfsHash);
        }
    }

    function pushHash(address _addr, string memory _ipfsHash) public {
        //ipfs上鏈 onlyOwner
        uint index = checkipfsWaitingArray(_ipfsHash);
        require(index != 0, "ipfs hash not in waiting array");
        index--;
        ipfsMap[_addr].push(_ipfsHash);
        ipfsArray.push(_ipfsHash);
        ipfsWaitingArray[index] = ipfsWaitingArray[ipfsWaitingArray.length - 1];
        ipfsWaitingArray.pop();
    }

    function checkipfsWaitingArray(
        string memory _ipfsHash
    ) public view returns (uint) {
        //回傳未審核ipfs index, 0 = 沒上傳
        for (uint i = 0; i < ipfsWaitingArray.length; ++i) {
            if (
                keccak256(abi.encodePacked(ipfsWaitingArray[i])) ==
                keccak256(abi.encodePacked(_ipfsHash))
            ) return i + 1;
        }
        return 0;
    }

    function getipfsArray() public view returns (string[] memory) {
        //onlyMember取得審核過的ipfs
        return ipfsArray;
    }

    function getipfsMap(address _addr) public view returns (string[] memory) {
        //onlyMember取得成員審核過的ipfs
        return ipfsMap[_addr];
    }

    function getipfsWaitingArray() public view returns (string[] memory) {
        //owner取得未審核ipfs
        return ipfsWaitingArray;
    }

    function getMemberWaitingArray() public view returns (address[] memory) {
        //owner取得未審核member
        return memberWaitingArray;
    }

    function getMemberArray() public view returns (address[] memory) {
        //onlyMember
        return memberArray;
    }
}

//---------------------------------------------------------------------------
contract Platform {
    //平台功能
    mapping(address => User) userMap;
    mapping(address => Project[]) projectMap;
    mapping(Project => address) projectOwnerMap;
    User[] userArray;
    event currency(uint _value);
    event pro(Project _addr);

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
            Project p = new Project{value: msg.value}(msg.sender, _projectName);
            projectMap[msg.sender].push(p);
            projectOwnerMap[p] = msg.sender;
            mappingUser(msg.sender).addProject(msg.sender, p);
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

    function sendHash(
        Project _project,
        string memory _ipfsHash
    ) public onlyUser {
        _project.sendHash(msg.sender, _ipfsHash);
    }

    function pushHash(
        Project _project,
        address _addr,
        string memory _ipfsHash
    ) public onlyUser {
        require(
            projectOwnerMap[_project] == msg.sender,
            "you are not project owner"
        );
        _project.pushHash(_addr, _ipfsHash);
    }

    function addMember(address _addr, Project _project) public {
        require(
            projectOwnerMap[_project] == msg.sender,
            "you are not project owner"
        );
        projectMap[_addr].push(_project);
        _project.addMember(_addr);
    }

    function requestMember(Project _project) public onlyUser {
        _project.requestMember(msg.sender);
    }

    // function scoreMember(
    //     address _to,
    //     Project _project
    // ) public onlyUser {
    //     User from = mappingUser(msg.sender);
    //     User to = mappingUser(_to);
    //     _project.scoreMember(from, to);
    // }

    function getipfsWaitingArray(
        Project _project
    ) public view returns (string[] memory) {
        require(
            projectOwnerMap[_project] == msg.sender,
            "you are not project owner"
        );
        return _project.getipfsWaitingArray();
    }

    function getMemberWaitingArray(
        Project _project
    ) public view returns (address[] memory) {
        require(
            projectOwnerMap[_project] == msg.sender,
            "you are not project owner"
        );
        return _project.getMemberWaitingArray();
    }

    function getMemberArray(
        Project _project
    ) public view returns (address[] memory) {
        return _project.getMemberArray();
    }

    function checkProjectRole(Project _project) public view returns (bool) {
        if (projectOwnerMap[_project] == msg.sender) return true;
        else return false;
    }
}
