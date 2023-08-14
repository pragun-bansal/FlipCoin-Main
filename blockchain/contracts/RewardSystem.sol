// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol"; // For signature verification

import "./Achievement.sol";

contract RewardSystem {
    using ECDSA for bytes32;
    address public owner;
    mapping(address => uint256) public userBalances;
    Achievement[] public achievements;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    function addAchievement(
        string memory title,
        string memory desc,
        int256 reward
    ) external onlyOwner {
        achievements.push(new Achievement(title, desc, reward));
    }

    function addToBalance(address user, uint256 amount) external onlyOwner {
        userBalances[user] += amount;
    }

    function claimReward(
        address user,
        uint256 rewardAmount,
        uint256 nonce,
        bytes memory signature
    ) external {
        require(user != address(0), "Invalid user address");
        require(rewardAmount > 0, "Reward amount must be greater than 0");

        bytes32 messageHash = keccak256(
            abi.encodePacked(user, rewardAmount, nonce, address(this))
        );

        require(
            verifySignature(user, messageHash, signature),
            "Invalid signature"
        );

        userBalances[user] += rewardAmount;
        // payable(user).transfer(rewardAmount);
        (bool callSuccess, ) = payable(user).call{value: rewardAmount}("");
        require(callSuccess, "Call failed");

        emit RewardClaimed(user, rewardAmount, nonce);
        emit RewardCredited(user, rewardAmount);
    }

    // add function for handling batch transactions
    function handleBatch() public {}

    function verifySignature(
        address signer,
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (bool) {
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        return recoveredSigner == signer;
    }

    event RewardClaimed(
        address indexed user,
        uint256 rewardAmount,
        uint256 nonce
    );
    event RewardCredited(address indexed user, uint256 rewardAmount);
}
