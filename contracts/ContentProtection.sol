// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentProtection {
    struct ContentRecord {
        string fileHash;      // SHA-256 hash of the file
        string ipfsHash;      // IPFS content identifier
        uint256 timestamp;    // Registration timestamp
        address owner;        // Content owner
        bool isValid;         // Whether the record is valid
    }
    
    mapping(string => ContentRecord) public content;
    mapping(address => uint256) public userContentCount;
    uint256 public totalContentCount;
    
    event ContentRegistered(
        string indexed contentId,
        string fileHash,
        string ipfsHash,
        uint256 timestamp,
        address indexed owner
    );
    
    event ContentRevoked(
        string indexed contentId,
        address indexed owner
    );
    
    modifier onlyOwner(string memory contentId) {
        require(
            content[contentId].owner == msg.sender,
            "Only content owner can perform this action"
        );
        _;
    }
    
    modifier contentExists(string memory contentId) {
        require(
            content[contentId].timestamp > 0,
            "Content does not exist"
        );
        _;
    }
    
    function registerContent(
        string memory contentId,
        string memory fileHash,
        string memory ipfsHash
    ) public returns (uint256) {
        require(
            content[contentId].timestamp == 0,
            "Content already registered"
        );
        require(
            bytes(contentId).length > 0,
            "Content ID cannot be empty"
        );
        require(
            bytes(fileHash).length > 0,
            "File hash cannot be empty"
        );
        
        content[contentId] = ContentRecord({
            fileHash: fileHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            isValid: true
        });
        
        userContentCount[msg.sender]++;
        totalContentCount++;
        
        emit ContentRegistered(
            contentId,
            fileHash,
            ipfsHash,
            block.timestamp,
            msg.sender
        );
        
        return block.timestamp;
    }
    
    function verifyContent(string memory contentId)
        public
        view
        contentExists(contentId)
        returns (
            string memory fileHash,
            string memory ipfsHash,
            uint256 timestamp,
            address owner,
            bool isValid
        )
    {
        ContentRecord memory record = content[contentId];
        return (
            record.fileHash,
            record.ipfsHash,
            record.timestamp,
            record.owner,
            record.isValid
        );
    }
    
    function revokeContent(string memory contentId)
        public
        contentExists(contentId)
        onlyOwner(contentId)
    {
        content[contentId].isValid = false;
        emit ContentRevoked(contentId, msg.sender);
    }
    
    function getContentCount() public view returns (uint256) {
        return totalContentCount;
    }
    
    function getUserContentCount(address user) public view returns (uint256) {
        return userContentCount[user];
    }
    
    function checkFileHashExists(string memory fileHash)
        public
        view
        returns (bool exists, string memory existingContentId)
    {
        // Note: This is a simplified check - in practice, you'd need
        // to maintain a mapping of fileHash => contentId for efficiency
        return (false, "");
    }
} 