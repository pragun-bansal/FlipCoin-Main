import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Transactionabi from "../utils/transactionsabi.json";
'0x2711ab6ecc46abeb70fce32ca3801625e54f10bbe29d5571…2cd18f86aafa1ab69e059289319e804033d16d5333715f51c
const useStyle = makeStyles((theme) => ({
  component: {
    marginTop: 55,
    padding: "30px 6%",
    display: "flex",
  },
  leftComponent: {
    paddingRight: 15,
    [theme.breakpoints.between(0, 960)]: {
      paddingRight: 0,
      marginBottom: 20,
    },
  },
  header: {
    padding: "15px 24px",
    background: "#fff",
  },
  bottom: {
    padding: "16px 22px",
    background: "#fff",
    boxShadow: "0 -2px 10px 0 rgb(0 0 0 / 10%)",
    borderTop: "1px solid #f0f0f0",
  },
  placeOrder: {
    display: "flex",
    marginLeft: "auto",
    background: "#fb641b",
    color: "#fff",
    borderRadius: 2,
    width: 250,
    height: 51,
  },
}));

const AdminPage = () => {
  const classes = useStyle();
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

//   const connectWallet = async () => {
//     if (typeof window.ethereum !== "undefined") {
//       try {
//         await window.ethereum.request({ method: "eth_requestAccounts" });
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const address = await signer.getAddress();
//         const balance = await provider.getBalance(address);
//         const etherBalance = ethers.utils.formatEther(balance);
//         setCryptoBalance(etherBalance);
//         console.log("Balance: ", etherBalance);

//         try {
//           const history = await provider.getHistory(address);
//           console.log("History:", history);
//           const formattedTransactions = await Promise.all(
//             history.map(async (tx) => {
//               const txReceipt = await provider.getTransactionReceipt(tx.hash);
//               return {
//                 hash: tx.hash,
//                 to: tx.to,
//                 value: ethers.utils.formatEther(tx.value),
//                 confirmed: txReceipt ? txReceipt.confirmations > 0 : false,
//               };
//             })
//           );
//           setTransactions(formattedTransactions);
//         } catch (error) {
//           console.error("Error fetching transactions:", error);
//         }
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//       }
//     } else {
//       console.error("No Ethereum wallet found.");
//     }
//   };

//   useEffect(() => {
//     connectWallet();
//   }, []);

  
  const rewardClaims = [
    {
      userAddress: "0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15",
      rewardAmount: 10,
      nonce: 408740,
      signature: "0xe1999ad496a12b61c94d78e3f93dd3a94767e48c64107a63…e97f3cb374cb9a7dce960a0c100092e5a572e5c1527f8851c"
    },
    {
      userAddress: "0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15",
      rewardAmount: 10,
      nonce: 439967,
      signature: "0xb84ad1b9af33560799790eaa63f943e8bf9057a33e8a9663…07c9c470eb334d5e162cc7d5bfbe127fdf28847eb0a5fa91b"
    },
  ];

  async function submitRewardBatch() {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer = provider.getSigner();
    //   const contract = new ethers.Contract(
    //     "0x04567D75c2bDB4A89cc71840d5194Be2aF0365A9",
    //     Transactionabi,
    //     signer
    //   );
        const privateKey = "749fd5aaae691acca5d7ad99db3ef39065a2fa3c4ea51c22af2c48536746c111"; // Admin's private key
        const wallet = new ethers.Wallet(privateKey, provider);

        const contractAddress = "CONTRACT_ADDRESS";
        const contractABI = []; // Add your contract's ABI

        const contract = new ethers.Contract(contractAddress, contractABI, wallet);

        const batch = [];

      console.log("rewardClaims", rewardClaims);
      for (let rwd of rewardClaims) {
        const { userAddress, rewardAmount, nonce, signature } = rwd;
        let sign 
        try {
            sign = ethers.utils.arrayify(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signature)));
        } catch (error) {
            console.error("Error parsing signature:", error);
        }
        
        console.log("sign", sign);
        const tx = await contract.populateTransaction.claimReward(
          userAddress,
          rewardAmount,
          nonce,
          sign
        );
        console.log("tx", tx);
        batch.push(tx);
      }

 
      const txResponse = await provider.sendTransaction({
        from: "0x2670d84e0C868c61aBD6d3dCd3f8F0dA61B7DfB4",
        to: "0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15",
        data: ethers.utils.defaultAbiCoder.encode(
          ["tuple(address,uint256)[],uint256"],
          [
            rewardClaims.map(({ userAddress, rewardAmount }) => [
              userAddress,
              rewardAmount,
            ]),
            0,
          ]
        ),
        gasLimit: ethers.utils.hexlify(5000000),
        value: ethers.utils.parseEther("0"), // No Ether sent
      });

      console.log("txResponse", txResponse);
      await txResponse.wait();
      console.log("Reward batch submitted successfully.");
    } catch (error) {
      console.error("Error submitting reward batch:", error);
    }
  }

  // Example reward claims

  return (
    <>
      <Grid container className={classes.component}>
        <Box className={classes.header}>
          Your Flipcoins balance is {cryptoBalance} FLC
        </Box>
        <Button onClick={submitRewardBatch}>Batch Request Approve</Button>
      </Grid>
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
        <DialogTitle>Latest Transactions</DialogTitle>
        <DialogContent>
          {transactions.map((tx) => (
            <div key={tx.hash}>
              <p>{tx.to}</p>
              <p>Value: {tx.value} ETH</p>
              <p>Status: {tx.confirmed ? "Confirmed" : "Pending"}</p>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <ToastMessageContainer />
    </>
  );
};

export default AdminPage;
