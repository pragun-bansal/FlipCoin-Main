const ethers = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");
const privateKey = "YOUR_PLATFORM_PRIVATE_KEY";
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "CONTRACT_ADDRESS";
const contractABI = []; // Add your contract's ABI

async function submitRewardBatch(rewardClaims) {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet
    );

    const batch = [];
    for (const { userAddress, rewardAmount } of rewardClaims) {
      const tx = await contract.populateTransaction.claimReward(
        userAddress,
        rewardAmount
      );
      batch.push(tx);
    }

    const txResponse = await provider.sendTransaction({
      to: contractAddress,
      data: ethers.utils.defaultAbiCoder.encode(
        ["tuple(address,uint256)[],uint256"],
        [rewardClaims.map(({ userAddress, rewardAmount }) => [userAddress, rewardAmount]), 0]
      ),
      gasLimit: ethers.utils.hexlify(5000000),
      value: ethers.utils.parseEther("0"), // No Ether sent
    });

    await txResponse.wait();

    console.log("Reward batch submitted successfully.");
  } catch (error) {
    console.error("Error submitting reward batch:", error);
  }
}

// Example reward claims
const rewardClaims = [
  {
    userAddress: "0x1234567890123456789012345678901234567890",
    rewardAmount: ethers.utils.parseEther("100"),
  },
  {
    userAddress: "0x9876543210987654321098765432109876543210",
    rewardAmount: ethers.utils.parseEther("50"),
  },
];

submitRewardBatch(rewardClaims);


// catch emit
const userAddress = "USER_ADDRESS"; // The address of the user you want to listen for

contract.on("RewardCredited", (user, rewardAmount, event) => {
  if (user === userAddress) {
    console.log(`Reward credited to user: ${user}`);
    console.log(`Reward Amount: ${rewardAmount}`);
  }
});



// claimRewardButton.addEventListener("click", async function() {
//     try {
//       const userAddress = await signer.getAddress();
//       const rewardAmount = 10; // Replace with the actual reward amount
//       const nonce = Math.floor(Math.random() * 1000000); // Generate a nonce
//       const message = ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [userAddress, rewardAmount, nonce]);
//       const messageHash = ethers.utils.keccak256(message);
//       const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

//       const rewardClaim = {
//         userAddress: userAddress,
//         rewardAmount: rewardAmount,
//         nonce: nonce,
//         signature: signature
//       };

//       await submitRewardBatches([rewardClaim]);

//       console.log("Reward claimed successfully!");
//     } catch (error) {
//       console.error("Error claiming reward:", error);
//     }
//   });
