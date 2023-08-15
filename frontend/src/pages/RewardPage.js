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
import Transactionabi from '../utils/transactionsabi.json'

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

const Rewards = () => {
  const classes = useStyle();
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const etherBalance = ethers.utils.formatEther(balance);
        setCryptoBalance(etherBalance);
        console.log("Balance: ", etherBalance);

        try {
          const history = await provider.getHistory(address);
          console.log("History:", history);
          const formattedTransactions = await Promise.all(
            history.map(async (tx) => {
              const txReceipt = await provider.getTransactionReceipt(tx.hash);
              return {
                hash: tx.hash,
                to: tx.to,
                value: ethers.utils.formatEther(tx.value),
                confirmed: txReceipt ? txReceipt.confirmations > 0 : false,
              };
            })
          );
          setTransactions(formattedTransactions);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("No Ethereum wallet found.");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const verifyRewardClaim = async (rewardClaim) => {
    try {
      const { userAddress, rewardAmount, nonce, signature } = rewardClaim;
      console.log("Verifying reward claim:", rewardClaim);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
      const message = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "uint256"],
        [userAddress, rewardAmount, nonce]
      );
      const messageHash = ethers.utils.keccak256(message);

      const recoveredAddress = await ethers.utils.verifyMessage(
        ethers.utils.arrayify(messageHash),
        signature
      );

      if (recoveredAddress.toLowerCase() === userAddress.toLowerCase()) {
        console.log("Signature is valid. Reward claim verified.");
        return true;
      } else {
        console.log("Invalid signature. Reward claim verification failed.");
        return false;
      }
    } catch (error) {
      console.error("Error verifying reward claim:", error);
      return false;
    }
  };

  const claimrewardfunc = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const rewardAmount = 10; // Replace with the actual reward amount
      const nonce = Math.floor(Math.random() * 1000000); // Generate a nonce
      const message = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "uint256"],
        [userAddress, rewardAmount, nonce]
      );
      const messageHash = ethers.utils.keccak256(message);
      const signature = await signer.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      const rewardClaim = {
        userAddress: userAddress,
        rewardAmount: rewardAmount,
        nonce: nonce,
        signature: signature,
      };

      verifyRewardClaim(rewardClaim);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <>
      <Grid container className={classes.component}>
        <Box className={classes.header}>
          Your Flipcoins balance is {cryptoBalance} FLC
        </Box>
        <Button onClick={() => setPopupOpen(true)}>Show Transactions</Button>
        <Button onClick={claimrewardfunc}>Claim Reward</Button>
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

export default Rewards;
