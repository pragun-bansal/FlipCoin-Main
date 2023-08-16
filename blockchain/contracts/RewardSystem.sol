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
        bytes32 messagehash;
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

    // function addToBalance(address user, uint256 amount) external onlyOwner {
    //     userBalances[user] += amount;
    // }
    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }


    function verifySignature(address signer,bytes32 messageHash,bytes memory signature) internal pure returns (bool) {
        bytes32 ethSignedMessageHash = keccak256( abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s) == signer;
    }

    function claimReward(address user,uint256 rewardAmount,uint256 nonce,bytes memory signature,bytes32 messagehash) public{
        require(user != address(0), "Invalid user address");
        require(rewardAmount > 0, "Reward amount must be greater than 0");
        


        bytes32 messageHash = keccak256(
            abi.encodePacked(user, rewardAmount,messagehash ,nonce)
        );

        // require(
        //     verifySignature(user, messageHash, signature),
        //     "Invalid signature"
        // );

        // userBalances[user] += rewardAmount;
        // Transfer FLC tokens from contract to user

        flcToken.transfer(user, rewardAmount); // Transfer tokens from contract to user
        emit RewardClaimed(user, rewardAmount, nonce);
        emit RewardCredited(user, rewardAmount);
    }


    // add function for handling batch transactions
    function handleBatch(RewardClaims[] memory rewardClaims) public {
        for(uint256 i=0;i<rewardClaims.length;i++){
            claimReward(rewardClaims[i].user,rewardClaims[i].rewardAmount,rewardClaims[i].nonce,rewardClaims[i].signature,rewardClaims[i].messagehash);
        }
    }

  

    event RewardClaimed(
        address indexed user,
        uint256 rewardAmount,
        uint256 nonce
    );

    function allow(address cntr,uint256 amount) public payable{

    }

    function fund(uint val,address reciver) public payable onlyOwner{
        // require(flcToken.approve(address(this), val+100),"Not allowed");
        // require(flcToken.allowance(address(this),0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15) >= val, "Insufficient allowance");
        // flcToken.transferFrom(address(this),0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15,val);
        flcToken.transfer(reciver,val);
    }


    function showBalance() public view returns(uint256){
        uint256 k=flcToken.balanceOf(address(this));
        return k;
    }

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }

    event RewardCredited(address indexed user, uint256 rewardAmount);
}