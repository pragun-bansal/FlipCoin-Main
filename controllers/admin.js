const ethers = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");
const privateKey = "YOUR_PLATFORM_PRIVATE_KEY";
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "CONTRACT_ADDRESS";
const contractABI = [];

async function submitRewardBatches(rewardClaims) {
  try {
    const batch = [];
    for (const { userAddress, rewardAmount } of rewardClaims) {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        wallet
      );
      const tx = await contract.populateTransaction.claimReward(
        userAddress,
        rewardAmount
      );
      batch.push(tx);
    }

    const signedTxs = [];
    for (const tx of batch) {
      const signedTx = await wallet.signTransaction(tx);
      signedTxs.push(signedTx);
    }

    const txHashes = [];
    for (const signedTx of signedTxs) {
      const txResponse = await provider.sendTransaction(signedTx);
      txHashes.push(txResponse.hash);
    }

    for (const txHash of txHashes) {
      const receipt = await provider.waitForTransaction(txHash);
    }

  } catch (error) {
    console.error("Error submitting reward batches:", error);
  }
}

const rewardClaims = [
  {
    userAddress: "USER_ADDRESS_1",
    rewardAmount: ethers.utils.parseEther("10"),
  },
  { userAddress: "USER_ADDRESS_2", rewardAmount: ethers.utils.parseEther("5") },
  // Add more reward claims as needed
];

// Call the function to submit reward batches
submitRewardBatches(rewardClaims);
