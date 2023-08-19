// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import the ERC-20 interface
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol"; // For signature verification
import "./achievement.sol";

contract RewardSystem {
    using ECDSA for bytes32;
    address public owner;
    IERC20 public flcToken; // Reference to the FLC ERC-20 token contract
    mapping(address => uint256) public userBalances;
    Achievement[] public achievements;

    constructor() {
        owner = msg.sender;
        flcToken = IERC20(0xc1c62B3f6Ba557233f4Fe93C0e824Ae04234666F); // Initialize the FLC token contract
    }

    struct RewardClaims{
        address user;
        uint256 rewardAmount;
        uint256 nonce;
        bytes signature;
        string messagehash;
    }


    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    function setFlcToken(address flcTokenAddress) external onlyOwner {
        flcToken = IERC20(flcTokenAddress); // Update the FLC token contract address
    }

    function addAchievement(
        string memory title,
        string memory desc,
        int256 reward
    ) external onlyOwner {
        achievements.push(new Achievement(title, desc, reward));
    }

     function getMessageHash(uint _amount,string memory _message,uint _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_amount, _message, _nonce));
    }

    function getEthSignedMessageHash( bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
    

    
    function recoverSigner(bytes32 _ethSignedMessageHash,bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature( bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function verify(address _signer,uint _amount,string memory _message,uint _nonce,bytes memory signature) public pure returns (bool) {
        bytes32 messageHash = getMessageHash( _amount, _message, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    // function claimReward(address user,uint rewardAmount,uint nonce,bytes memory signature,string memory message) public{
    //     require(user != address(0), "Invalid user address");
    //     require(rewardAmount > 0, "Reward amount must be greater than 0");
    //     // bytes32 messageHash = getMessageHash( rewardAmount, message, nonce);
    //     // bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    //     // require( recoverSigner(ethSignedMessageHash, signature) == user,"Invalid signature");

    //     // if(!verify(user,rewardAmount,message,nonce, signature)) return;

    //     // require(verify(user,rewardAmount,message,nonce, signature), "Invalid signature");
    //     // userBalances[user] += rewardAmount;
    //     // Transfer FLC tokens from contract to user

    //     flcToken.transfer(user, rewardAmount); // Transfer tokens from contract to user
    //     emit RewardClaimed(user, rewardAmount, nonce);
    //     emit RewardCredited(user, rewardAmount);
    // }

    function claimReward(address user,uint256 rewardAmount,uint256 nonce,bytes memory signature,string memory message) public{
        require(user != address(0), "Invalid user address");
        require(rewardAmount > 0, "Reward amount must be greater than 0");
        
        
        bytes32 messageHash = getMessageHash( rewardAmount, message, nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        require( recoverSigner(ethSignedMessageHash, signature) == user,"Invalid signature");

        flcToken.transfer(user, rewardAmount); // Transfer tokens from contract to user
        emit RewardClaimed(user, rewardAmount, nonce);
        emit RewardCredited(user, rewardAmount);
    }


    function handleBatch(RewardClaims[] memory rewardClaims) public onlyOwner{
        for(uint256 i=0;i<rewardClaims.length;i++){
            claimReward(rewardClaims[i].user,rewardClaims[i].rewardAmount,rewardClaims[i].nonce,rewardClaims[i].signature,rewardClaims[i].messagehash);
        }
    }

    event RewardClaimed(
        address indexed user,
        uint256 rewardAmount,
        uint256 nonce
    );

    function fund(uint val,address reciver) public payable onlyOwner{
        flcToken.transfer(reciver,val);
    }


    function showBalance() public view returns(uint256){
        uint256 k=flcToken.balanceOf(address(this));
        return k;
    }



    event RewardCredited(address indexed user, uint256 rewardAmount);
}