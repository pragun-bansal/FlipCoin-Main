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
  Container,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Flcabi from '../utils/flcabi.json'

/*

user model = {
  used achivemnts = {
    "achivem1","achivem2","achivem3"
  }
}
*/
const achivements = [
  {
    "title": "Achievment 1",
    "description": "First time user",
    "reward": 100,
    "minthreshold": 30,
    "imageuri":"",
  },
  {
    "description": "First time user",
    "reward": 500,
    "minthreshold": 30
  },
  {
    "description": "First time user",
    "reward": 10,
    "minthreshold": 30
  },
  {
    "description": "First time user",
    "reward": 30,
    "minthreshold": 30
  },
]

const useStyle = makeStyles((theme) => ({
  component: {
    marginTop: 55,
    padding: "30px 6%",
    display: "flex",
    spacing: 4,
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const privateKey = "8d1444ef95f13c8d0713e4319463d8d24316940a21a9624b81978d84c6c616f3"; // Admin's private key
    const sender = new ethers.Wallet(privateKey, provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract("0xc1c62B3f6Ba557233f4Fe93C0e824Ae04234666F",Flcabi, sender);
    const walletaddress = await signer.getAddress();
    console.log("sender's address is: " , walletaddress)
    const balance = await contract.balanceOf(walletaddress);
    console.log("balance: ",balance)
    setCryptoBalance(ethers.utils.formatEther(balance));
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const verifyRewardClaim = async (rewardClaim) => {
    try {
      const { userAddress, rewardAmount, nonce, signature } = rewardClaim;
      console.log("Verifying reward claim:", rewardClaim);

      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const accounts = await provider.listAccounts();
      // const signer = provider.getSigner(accounts[1]);

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

  const claimrewardfunc = async (rewardAmount) => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner(accounts[1]);
      // const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      // const rewardAmount = 1; // Replace with the actual reward amount
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
        messageHash: messageHash
      };

      verifyRewardClaim(rewardClaim);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <Container maxWidth={"lg"}>
      <Grid container className={classes.component}>
      {achivements.map((achivement,index) => (
        <Card onClick={()=>claimrewardfunc(achivement.reward)} key={index}>
          <CardContent>
           {achivement.description}
           {achivement.reward}
          </CardContent>
        </Card>
      ))}        
      </Grid>
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
    </Container>
  );
};

export default Rewards;
