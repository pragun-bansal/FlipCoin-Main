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


  const rewardClaims = [
    {
      userAddress: "0x2670d84e0C868c61aBD6d3dCd3f8F0dA61B7DfB4",
      rewardAmount: 10,
      nonce: 902842,
      signature: "0x2b354bc304b7e427314f6295b2d018ff46bdb4b2791863e4c75477f8a0978648056a07a8c78997809ab6bf68de50177573011204ed3270b6e91680104f5c7db91b"
    },
  ];

  async function submitRewardBatch() {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const privateKey = "749fd5aaae691acca5d7ad99db3ef39065a2fa3c4ea51c22af2c48536746c111"; // Admin's private key
        const sender = new ethers.Wallet(privateKey, provider);
        // await sender.sendTransaction({to: '0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15', value: ethers.utils.parseEther("0.001")});
        const contractAddress = "0x04567D75c2bDB4A89cc71840d5194Be2aF0365A9";
        const contract = new ethers.Contract(contractAddress,Transactionabi, sender);
        console.log("contract", contract);
        const batch = [];

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
          console.log(tx);
          batch.push(tx);
        }

 
        const txResponse = await sender.sendTransaction({
          to: "0x99af18A4c649F44d839741711AFB5998A335feCd",
          data: ethers.utils.defaultAbiCoder.encode(
            ["tuple(address,uint256)[],uint256"],
            [rewardClaims.map(({ userAddress, rewardAmount }) => [userAddress,rewardAmount,]),0,]
          ),
          gasLimit: ethers.utils.hexlify(5000000),
          value: ethers.utils.parseEther("0"), 
        });

        await txResponse.wait();
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
