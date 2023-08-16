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
      userAddress: "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      rewardAmount: 10000,
      nonce: 630293,
      signature: "0x27adc97d07edfa406306619ce3fe7d3e7b771be7df6fb3d94b3af8bd4f2b8a7e4e77910ef13537fd86197832b6c2db68db22f16146d9f80d5c9e854d3b80a4be1b"
    },
  ];

  async function submitRewardBatch() {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const privateKey = "749fd5aaae691acca5d7ad99db3ef39065a2fa3c4ea51c22af2c48536746c111"; // Admin's private key
        const sender = new ethers.Wallet(privateKey, provider);
        // await sender.sendTransaction({to: '0xa421D70fc0a3eda6fbaE1C0C94c93E54ac1Dcd15', value: ethers.utils.parseEther("0.001")});
        const contractAddress = "0x3155Bac72b630DD7E2b179fE53fBF7ecd4D21029";
        const contract = new ethers.Contract(contractAddress,Transactionabi, sender);
        console.log("contract", contract);
        const balance = await contract.showBalance();
        console.log("balance", ethers.utils.formatEther(balance));


        console.log("contract", contract);
        const batch = [];

        for (let rwd of rewardClaims) {
          const { userAddress, rewardAmount, nonce, signature } = rwd;
          // let sign 
          // // try {
          //     // sign = ethers.utils.arrayify(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signature)));
          // } catch (error) {
          //     console.error("Error parsing signature:", error);
          // }
          
          // console.log("sign", sign.join(' '));

        
          // const accounts = await provider.listAccounts();
          // const signer = provider.getSigner(accounts[0]);
          // // const trn = {
          //   to: "0x2707bd1ba885f9B4D141d214Ea18a72728fb3158",
          //   value: ethers.utils.parseEther('0.001', 'ether')
          // };
          // const transaction = await signer.sendTransaction(trn);

          

          // console.log("transaction", transaction);
        
          const tx = await contract.claimReward(
            userAddress,
            rewardAmount,
            nonce,
            signature
          );
          const tx1 = await contract.fund();
          console.log("tx", tx);
          console.log(tx1);
          batch.push(tx);
        }

        
        // const txResponse = await sender.sendTransaction({
        //   to: "0x99af18A4c649F44d839741711AFB5998A335feCd",
        //   value: ethers.utils.parseEther("0"), 
        // });

        // await txResponse.wait();
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
