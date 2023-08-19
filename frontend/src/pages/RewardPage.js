import React, { useEffect, useState } from "react";
import { useReward } from "react-rewards";
import { makeStyles, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Container, CircularProgress,} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Flcabi from "../utils/flcabi.json";
import { AiFillLock } from "react-icons/ai";
import axios from "../adapters/axios";
import { ADMIN_PVT_KEY, BACKEND_URL, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../bkd";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Transactionabi from "../utils/transactionsabi.json";
import toastMessage from "../utils/toastMessage";
import authentication from "../adapters/authentication";
import { setUserInfo } from "../actions/userActions";


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
  const { reward, isAnimating } = useReward("rewardId", "confetti", {elementCount: 100,});
  
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user,isAuthenticate } = useSelector((state) => state.userReducer);
  let userid;
  if (user._id) userid = user._id;
  console.log("userid: ", userid);
  // else userid = "64e06a77c96091c2139abc82";
  const dispatch = useDispatch();
  const history = useHistory();

  if(!isAuthenticate){
    toastMessage("Please login to enter Flipkart Rewards", "error");
    history.push("/login");
  }

  useEffect(() => {
    authentication().then((res) => {
      console.log("user: ", res);
      dispatch(setUserInfo(res.user))
    })
  }, [dispatch]);

  useEffect(() => {
    const getAchievments = async () => {
      let { data } = await axios.get(`${BACKEND_URL}/achievements`);
      data = data.filter((achievement) => achievement.active);

      console.log("user availableachievements: ", user.availableachievements);
      console.log("user claimedachievements: ", user.claimedachievements);
      console.log("data: ", data);

      // in case any object of user.availableachievements has achievementId == data's achievementId
      // then that achievement is available to user
      const useravailableachievementsids = user.availableachievements.map((achievement) => achievement.achievementId);
      let temp = data.filter((achievement) => useravailableachievementsids.includes(achievement._id));
      setAvailableAchievements(temp);

      const userclaimedachievementsids = user.claimedachievements.map((achievement) => achievement.achievementId);
      console.log("userclaimedachievementsids: ", userclaimedachievementsids);
      temp  = data.filter((achievement) => userclaimedachievementsids.includes(achievement._id));
      setClaimedAchievements(temp);

      temp = data.filter((achievement) => !(useravailableachievementsids.includes(achievement._id) || userclaimedachievementsids.includes(achievement._id)));
      setLockedAchievements(temp);

      console.log("availableAchievements: ", availableAchievements);
      console.log("claimedAchievements: ", claimedAchievements);
      console.log("lockedAchievements: ", lockedAchievements);

      setLoading(false);
    };
    getAchievments();
  }, []);

  // user state from redux

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const sender = new ethers.Wallet(ADMIN_PVT_KEY, provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(TOKEN_ADDRESS, Flcabi,sender);
    const walletaddress = await signer.getAddress();
    const balance = await contract.balanceOf(walletaddress);
    setCryptoBalance(ethers.utils.formatEther(balance));
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const claimrewardfunc = async (rewardAmount, achievementid) => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner(accounts[0]);
      const userAddress = await signer.getAddress();

      const nonce = Math.floor(Math.random() * 1000000);
      const contract = new ethers.Contract(CONTRACT_ADDRESS ,Transactionabi,signer);
      const message = "secret message";
      let messageHash = await contract.getMessageHash(rewardAmount,message,nonce);
      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

      await axios.post(`${BACKEND_URL}/requests`, {
        address: userAddress,
        amount: rewardAmount,
        nonce: nonce,
        signature: signature,
        message: message,
        userid: userid,
        achievementid: achievementid,
        approved: false,
      });
      toastMessage("Reward claimed successfully", "success");
      setTimeout(() => {
      window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error claiming reward:", error);
    }

    // add to claimed achievements
    const temp = availableAchievements.filter((achievement) => achievement._id === achievementid);
    setClaimedAchievements([...claimedAchievements, ...temp]);
  };

  if(loading) return(
    <div className="flex justify-center items-center h-screen">
      <CircularProgress />
    </div>
  )

  return (
    <Container maxWidth={"lg"} className="mx-auto">
      <Grid container className={classes.component}>
        {availableAchievements.map((ach, idx) => (
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
              {
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  disabled={isAnimating}
                  onClick={() => {
                    reward();
                    claimrewardfunc(ach.reward, ach._id);
                  }}
                >
                  {
                    <div id="rewardId" className="w-full h-full ">
                      Claim Reward
                      <p className=" ">({ach.reward} FLC)</p>
                    </div>
                  }
                </button>
              }
            </div>
          </div>
        ))}
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
              {
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  disabled={isAnimating || !ach.isEligible}
                  // onClick={reward}
                >
                  {
                    <div className="w-full h-full py-2  flex items-center justify-center">
                      <AiFillLock size={20} />
                    </div>
                  }
                </button>
              }
            </div>
          </div>
        ))}
        {claimedAchievements.map((ach, idx) => (
          <div
            className={`w-72 h-[340px] bg-white shadow   relative rounded-md m-4 p-4`}
            key={idx}
          >
            {
              <div className="overlay w-full h-full absolute z-20 flex items-center justify-center rounded-md top-0 left-0">
                <img
                  src="https://i.postimg.cc/Fsn0tQQ7/claimed.png"
                  alt="locked"
                  className="w-36 h-36 "
                />
              </div>
            }
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

        {/* <Button onClick={()=>{claimrewardfunc(0,0)}}>Claim Reward</Button> */}
      </Grid>
   
      <ToastMessageContainer />
    </Container>
  );
};

export default Rewards;