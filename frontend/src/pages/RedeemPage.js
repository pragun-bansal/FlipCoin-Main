import React, { useEffect, useState } from "react";
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
import { useHistory } from "react-router-dom";
import Transactionabi from "../utils/transactionsabi.json";

const rewards = [
  {
    title: "Summer Sale",
    description: "Get amazing discounts on summer collection!",
    percentageoff: 25,
    maxoff: 50,
    delivery: true,
    cost: 100, // Sample cost in currency
  },
  {
    title: "Back-to-School Deal",
    description: "Save big on school supplies and essentials.",
    percentageoff: 15,
    maxoff: 30,
    delivery: true,
    cost: 50, // Sample cost in currency
  },
  {
    title: "Flash Sale",
    description: "Hurry, limited-time offer on selected items.",
    percentageoff: 30,
    maxoff: 100,
    delivery: false,
    cost: 75, // Sample cost in currency
  },
  {
    title: "Holiday Special",
    description: "Celebrate the holidays with our exclusive discounts.",
    percentageoff: 20,
    maxoff: 50,
    delivery: true,
    cost: 120, // Sample cost in currency
  },
  {
    title: "Clearance Sale",
    description: "Last chance to grab products at unbeatable prices.",
    percentageoff: 40,
    maxoff: 75,
    delivery: true,
    cost: 60, // Sample cost in currency
  },
];

// console.log(re);

// console.log(dummyData);

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

const RedeemPage = () => {
  const classes = useStyle();
  const { reward, isAnimating } = useReward("rewardId", "confetti", {
    elementCount: 100,
  });

  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [lockedRewards, setLockedRewards] = useState([]);

  const { user } = useSelector((state) => state.userReducer);
  let userid;
  if (user._id) userid = user._id;
  else userid = "64e06a77c96091c2139abc82";
  //   useEffect(() => {
  // if(!user.isAuthenticate){
  //   window.location.replace("/login");
  // }

  //     const getRewards = async () => {
  //       let { data } = await axios.get(`${BACKEND_URL}/rewards`);
  //       data = data.filter((achievement) => achievement.active);
  //       console.log(data);

  //       const availableRewards = data.filter((achievement) =>
  //         user.availableRewards.includes(achievement._id)
  //       );
  //       console.log("availableRewards: ", availableRewards);
  //       setAvailableRewards(availableRewards);

  //       const claimedRewards = data.filter((achievement) =>
  //         user.claimedRewards.includes(achievement._id)
  //       );
  //       setClaimedRewards(claimedRewards);

  //       const lockedRewards = data.filter(
  //         (achievement) =>
  //           !(
  //             user.availableRewards.includes(achievement._id) ||
  //             user.claimedRewards.includes(achievement._id)
  //           )
  //       );
  //       setLockedRewards(lockedRewards);
  //       const avail = ["64e0586994c36a0c23daa8f7"];
  //       const claimed = ["64dfb86d0d337d557aab7e7c"];

  //       const availableAchievements = data.filter((achievement) =>
  //         avail.includes(achievement._id)
  //       );
  //       console.log("availableAchievements: ", availableAchievements);
  //       setAvailableAchievements(availableAchievements);

  //       const claimedAchievements = data.filter((achievement) =>
  //         claimed.includes(achievement._id)
  //       );
  //       setClaimedAchievements(claimedAchievements);

  //       const lockedAchievements = data.filter(
  //         (achievement) =>
  //           !(
  //             avail.includes(achievement._id) || claimed.includes(achievement._id)
  //           )
  //       );
  //       setLockedAchievements(lockedAchievements);
  //     };
  //     getRewards();
  //   }, []);

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

  //   const claimrewardfunc = async (rewardAmount, achievementid) => {
  //     try {
  //       await window.ethereum.request({ method: "eth_requestAccounts" });
  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //       const accounts = await provider.listAccounts();
  //       const signer = provider.getSigner(accounts[1]);
  //       const userAddress = await signer.getAddress();

  //       const nonce = Math.floor(Math.random() * 1000000);
  //       const contract = new ethers.Contract(
  //         "0x974106287971A6f154d5FEa9231a329408b73f4f",
  //         Transactionabi,
  //         signer
  //       );
  //       const message = "secret message";
  //       let messageHash = await contract.getMessageHash(
  //         rewardAmount,
  //         message,
  //         nonce
  //       );
  //       const signature = await signer.signMessage(
  //         ethers.utils.arrayify(messageHash)
  //       );

  //       axios.post(`${BACKEND_URL}/requests`, {
  //         address: userAddress,
  //         amount: rewardAmount,
  //         nonce: nonce,
  //         signature: signature,
  //         message: message,
  //         userid: userid,
  //         achievementid: achievementid,
  //         approved: false,
  //       });
  //     } catch (error) {
  //       console.error("Error claiming reward:", error);
  //     }
  //   };

  return (
    <Container maxWidth={"xl"} className="mt-20">
      <h1 className="text-2xl font-bold text-[#242424]  text-center py-2">
        Redeem Flipcoins
      </h1>
      <Grid container className={`mt-0 pt-0 mx-auto flex justify-center `}>
        {rewards.map((rew, idx) => (
          <div
            className={`w-72 max-h-[400px] h-[320px]bg-white shadow   relative rounded-md m-4  p-4`}
            key={idx}
          >
            <div
              className="h-48 w-full  flex flex-col justify-between p-4 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(https://i.postimg.cc/rmRtsgYF/redeem.png)`,
              }}
            ></div>
            <div className="p-4 flex flex-col items-center">
              <h1 className="text-gray-800 text-center text-lg mt-1">
                {rew.title}
              </h1>
              <p className="text-center">{rew.description}</p>
              {
                <button
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    // claimrewardfunc(rew.reward, rew._id);
                  }}
                >
                  {
                    <div id="rewardId" className="w-full h-full ">
                      Redeem Coupon
                      <p className=" ">({rew.cost} FLC)</p>
                    </div>
                  }
                </button>
              }
            </div>
          </div>
        ))}
        {claimedRewards.map((rew, idx) => (
          <div
            className={`w-72 h-[340px] bg-white shadow   relative rounded-md m-4 p-4`}
            key={idx}
          >
            {
              <div className="overlay w-full h-full absolute z-20 flex items-center justify-center rounded-md top-0 left-0">
                <img
                  src="https://i.postimg.cc/rmRtsgYF/redeem.png"
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
                {rew.title}
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

      <ToastMessageContainer />
    </Container>
  );
};

export default RedeemPage;