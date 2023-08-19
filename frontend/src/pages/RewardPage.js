import React, { useEffect, useState} from "react";
import { useReward } from "react-rewards";
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
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Flcabi from "../utils/flcabi.json";
import { AiFillLock } from "react-icons/ai";
import axios from "../adapters/axios";
import { BACKEND_URL } from "../bkd";
import { useSelector } from "react-redux";
import {useHistory} from "react-router-dom"
import Transactionabi from "../utils/transactionsabi.json";

// const achievements = [
//   {
//     title: "First Order",
//     description: "First time user",
//     reward: 100,
//     minthreshold: 30,
//     isEligible: true,
//     imageuri: "",
//     claimed: false,
//   },
//   {
//     title: "Spend more than ₹2000",
//     description: "First time user",
//     reward: 100,
//     minthreshold: 30,
//     isEligible: false,
//     imageuri: "",
//     claimed: false,
//   },
//   {
//     title: "Spend a total of ₹5000",
//     description: "First time user",
//     reward: 100,
//     minthreshold: 30,
//     isEligible: true,
//     imageuri: "",
//     claimed: true,
//   },
// ];


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
  const { reward, isAnimating } = useReward("rewardId", "confetti", {
    elementCount: 100,
  });

  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);

  const {user} = useSelector((state) => state.userReducer);
  let userid 
  if(user._id) userid = user._id
  else userid = "64e06a77c96091c2139abc82"
  useEffect(() => {
    // if(!user.isAuthenticate){
    //   window.location.replace("/login");
    // }
    const getAchievments = async () => {
      let { data } = await axios.get(`${BACKEND_URL}/achievements`);
      data = data.filter((achievement) => achievement.active);
      console.log(data);
      
      // const availableAchievements = data.filter((achievement) => user.availableachievements.includes(achievement._id));
      // console.log("availableAchievements: ", availableAchievements);
      // setAvailableAchievements(availableAchievements);
      
      // const claimedAchievements = data.filter((achievement) => user.claimedachievements.includes(achievement._id));
      // setClaimedAchievements(claimedAchievements);
      
      // const lockedAchievements = data.filter((achievement) => !(user.availableachievements.includes(achievement._id) || user.claimedachievements.includes(achievement._id)));
      // setLockedAchievements(lockedAchievements);
      const avail =["64e0586994c36a0c23daa8f7"]
      const claimed =["64dfb86d0d337d557aab7e7c"]

      const availableAchievements = data.filter((achievement) => avail.includes(achievement._id));
      console.log("availableAchievements: ", availableAchievements);
      setAvailableAchievements(availableAchievements);
      
      const claimedAchievements = data.filter((achievement) => claimed.includes(achievement._id));
      setClaimedAchievements(claimedAchievements);
      
      const lockedAchievements = data.filter((achievement) => !(avail.includes(achievement._id) || claimed.includes(achievement._id)));
      setLockedAchievements(lockedAchievements);
      
      
    };
    getAchievments();
  }, []);


  // user state from redux


  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const privateKey =
      "8d1444ef95f13c8d0713e4319463d8d24316940a21a9624b81978d84c6c616f3"; // Admin's private key
    const sender = new ethers.Wallet(privateKey, provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      "0xc1c62B3f6Ba557233f4Fe93C0e824Ae04234666F",
      Flcabi,
      sender
    );
    const walletaddress = await signer.getAddress();
    console.log("sender's address is: ", walletaddress);
    const balance = await contract.balanceOf(walletaddress);
    console.log("balance: ", balance);
    setCryptoBalance(ethers.utils.formatEther(balance));
  };

  useEffect(() => {
    connectWallet();
  }, []);


  const claimrewardfunc = async (rewardAmount,achievementid) => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner(accounts[1]);
      const userAddress = await signer.getAddress();

      const nonce = Math.floor(Math.random() * 1000000); 
      const contract = new ethers.Contract('0x974106287971A6f154d5FEa9231a329408b73f4f',Transactionabi,signer)
      const message = "secret message";
      let messageHash = await contract.getMessageHash(rewardAmount,message , nonce);
      const signature = await signer.signMessage( ethers.utils.arrayify(messageHash) );

  
      axios.post(`${BACKEND_URL}/requests`,{
        address: userAddress,
        amount: rewardAmount,
        nonce: nonce,
        signature: signature,
        message: message,
        userid: userid,
        achievementid:achievementid,
        approved: false
      })

    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <Container maxWidth={"lg"} className="mx-auto">
    <h1 className="color-[#2D2D2D] text-4xl font-bold text-center mt-8 mb-8">Available Rewards</h1>
      <Grid container className={classes.component}>
        {availableAchievements.map((ach, idx) => (
          <div
            className={`w-72 h-[340px] bg-white shadow   relative rounded-md m-4 p-4`}
            key={idx}
          >
            {/* {(
              <div className="overlay w-full h-full absolute z-20 flex items-center justify-center rounded-md top-0 left-0">
                <img
                  src="https://i.postimg.cc/Fsn0tQQ7/claimed.png"
                  alt="locked"
                  className="w-36 h-36 "
                />
              </div>
            )} */}
            <div
              className="h-48 w-full  flex flex-col justify-between p-4 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(https://i.postimg.cc/GmhsDC5K/reward2.jpg)`,
              }}
            ></div>
            <div className="p-4 flex flex-col items-center">
              <h1 className="text-gray-800 text-center text-lg mt-1">
                {ach.title}
              </h1>
              {(
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  disabled={isAnimating}
                  onClick={()=>{reward();claimrewardfunc(ach.reward,ach._id)}}
                >
                  {(
                    <div id="rewardId" className="w-full h-full ">
                      Claim Reward
                      <p className=" ">({ach.reward} FLC)</p>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </Grid>
      <h1 className="color-[#2D2D2D] text-4xl font-bold text-center mt-8 mb-8">Locked Rewards</h1>
      <Grid container className={classes.component}>
        {lockedAchievements.map((ach, idx) => (
          <div
            className={`w-72 h-[340px] bg-white shadow   relative rounded-md m-4 p-4`}
            key={idx}
          >
            <div
              className="h-48 w-full  flex flex-col justify-between p-4 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(https://i.postimg.cc/GmhsDC5K/reward2.jpg)`,
              }}
            ></div>
            <div className="p-4 flex flex-col items-center">
              <h1 className="text-gray-800 text-center text-lg mt-1">
                {ach.title}
              </h1>
              {(
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  disabled={isAnimating || !ach.isEligible}
                  // onClick={reward}
                >
                  {(
                    <div className="w-full h-full py-2  flex items-center justify-center">
                      <AiFillLock size={20} />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </Grid>
      <h1 className="color-[#2D2D2D] text-4xl font-bold text-center mt-8 mb-8">Claimed Rewards</h1>
      <Grid container className={classes.component}>
        {claimedAchievements.map((ach, idx) => (
          <div
            className={`w-72 h-[340px] bg-white shadow   relative rounded-md m-4 p-4`}
            key={idx}
          >
            {(
              <div className="overlay w-full h-full absolute z-20 flex items-center justify-center rounded-md top-0 left-0">
                <img
                  src="https://i.postimg.cc/Fsn0tQQ7/claimed.png"
                  alt="locked"
                  className="w-36 h-36 "
                />
              </div>
            )}
            <div
              className="h-48 w-full  flex flex-col justify-between p-4 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(https://i.postimg.cc/GmhsDC5K/reward2.jpg)`,
              }}
            ></div>
            <div className="p-4 flex flex-col items-center">
              <h1 className="text-gray-800 text-center text-lg mt-1">
                {ach.title}
              </h1>
              {/* {!ach.claimed && (
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  disabled={isAnimating || !ach.isEligible}
                  onClick={reward}
                >
                  {!ach.isEligible ? (
                    <div className="w-full h-full py-2  flex items-center justify-center">
                      <AiFillLock size={20} />
                    </div>
                  ) : (
                    <div id="rewardId" className="w-full h-full ">
                      Claim Reward
                      <p className=" ">({ach.reward} FLC)</p>
                    </div>
                  )}
                </button>
              )} */}
            </div>
          </div>
        ))}
      </Grid>
      <Grid container className={classes.component}>
        <Box className={classes.header}>
          Your Flipcoins balance is {cryptoBalance} FLC
        </Box>
        <Button onClick={() => setPopupOpen(true)}>Show Transactions</Button>

        {/* <Button onClick={()=>{claimrewardfunc(0,0)}}>Claim Reward</Button> */}
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
