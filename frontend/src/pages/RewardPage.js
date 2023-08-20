import React, { useEffect, useState } from "react";
import { useReward } from "react-rewards";
import {
  makeStyles,
  Grid,
  Container,
  CircularProgress,
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import { AiFillLock } from "react-icons/ai";
import axios from "../adapters/axios";
import { BACKEND_URL, CONTRACT_ADDRESS } from "../bkd";
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
    height: "fit-content",
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

  const [transactions, setTransactions] = useState([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, isAuthenticate } = useSelector((state) => state.userReducer);
  // const user = {
  //   _id: {
  //     $oid: "64e067592f2b67f1c0e81fa9",
  //   },
  //   fname: "Shivam",
  //   lname: "Gupta",
  //   password: "$2a$12$QIcTrEiLhxAL6rthb1iKhOImIA6olIGrkhA1CCE1MIqG3kMHfUR9m",
  //   phone: 7015145611,
  //   role: "admin",
  //   totalOrders: 15,
  //   totalAmount: 945184,
  //   claimedachievements: [
  //     {
  //       achievementId: {
  //         $oid: "64e0cfce3180bd12b0734131",
  //       },
  //       claimedDate: {
  //         $date: "2023-08-19T14:37:28.477Z",
  //       },
  //       _id: {
  //         $oid: "64e0d3d9abfd8f388b82123e",
  //       },
  //     },
  //     {
  //       achievementId: {
  //         $oid: "64e0d137a1da333ed344579b",
  //       },
  //       claimedDate: {
  //         $date: "2023-08-19T14:37:28.477Z",
  //       },
  //       _id: {
  //         $oid: "64e0d3e2abfd8f388b821265",
  //       },
  //     },
  //     {
  //       achievementId: {
  //         $oid: "64e0ccfb85b8439299b785dd",
  //       },
  //       claimedDate: {
  //         $date: "2023-08-19T14:45:32.311Z",
  //       },
  //       _id: {
  //         $oid: "64e0d5a699340f591144a497",
  //       },
  //     },
  //   ],
  //   availableachievements: [
  //     {
  //       achievementId: {
  //         $oid: "64e0d2cf58d65abfae0564a1",
  //       },
  //       unlockDate: {
  //         $date: "2023-08-19T14:45:48.803Z",
  //       },
  //       _id: {
  //         $oid: "64e0d59c99340f591144a47a",
  //       },
  //     },
  //   ],
  //   tokens: [
  //     {
  //       token:
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE1OTd9.l9GsTEmkxWUL-zddKZZNdOw-5ZQ3HjK3DLhbbSDmYS8",
  //       _id: {
  //         $oid: "64e0c30d1e3ae320de4d881f",
  //       },
  //     },
  //     {
  //       token:
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE3ODZ9.EbBTV8QP7MWnsEX-X7caZqckMcSeRbF1qoPJE3ZWzns",
  //       _id: {
  //         $oid: "64e0c3ca1e3ae320de4d8850",
  //       },
  //     },
  //     {
  //       token:
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE5NDV9.hQpW-6iHmlD1SJJ6zu3BIMmcM4p6vWf3ttTEPmox2xM",
  //       _id: {
  //         $oid: "64e0c4691e3ae320de4d8871",
  //       },
  //     },
  //     {
  //       token:
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTIwMDd9.e15itZoKXLht7uT2MsmYTC826J15My7Zmb47GECxC6Q",
  //       _id: {
  //         $oid: "64e0c4a71e3ae320de4d8886",
  //       },
  //     },
  //   ],
  //   __v: 37,
  //   availableCoupons: [],
  // };

  // const isAuthenticate = true;

  let userid;
  if (user._id) userid = user._id;
  console.log("userid: ", userid);
  // else userid = "64e06a77c96091c2139abc82";
  const dispatch = useDispatch();
  const history = useHistory();

  if (!isAuthenticate) {
    toastMessage("Please login to enter Flipkart Rewards", "error");
    history.push("/login");
  }

  useEffect(() => {
    authentication().then((res) => {
      console.log("user: ", res);
      dispatch(setUserInfo(res.user));
    });
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
      const useravailableachievementsids = user.availableachievements.map(
        (achievement) => achievement.achievementId
      );
      let temp = data.filter((achievement) =>
        useravailableachievementsids.includes(achievement._id)
      );
      setAvailableAchievements(temp);
      console.log("availableAchievements: ", temp);
      const userclaimedachievementsids = user.claimedachievements.map(
        (achievement) => achievement.achievementId
      );
      console.log("userclaimedachievementsids: ", userclaimedachievementsids);
      temp = data.filter((achievement) =>
        userclaimedachievementsids.includes(achievement._id)
      );
      setClaimedAchievements(temp);
      console.log("claimedAchievements: ", temp);

      temp = data.filter(
        (achievement) =>
          !(
            useravailableachievementsids.includes(achievement._id) ||
            userclaimedachievementsids.includes(achievement._id)
          )
      );
      setLockedAchievements(temp);


      
      console.log("lockedAchievements: ", temp);

      setLoading(false);
    };
    getAchievments();
  }, []);

  // user state from redux

  const claimrewardfunc = async (rewardAmount, achievementid) => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner(accounts[0]);
      const userAddress = await signer.getAddress();

      const nonce = Math.floor(Math.random() * 1000000);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Transactionabi,
        signer
      );
      const message = "secret message";
      let messageHash = await contract.getMessageHash(
        rewardAmount,
        message,
        nonce
      );
      const signature = await signer.signMessage(
        ethers.utils.arrayify(messageHash)
      );

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
    const temp = availableAchievements.filter(
      (achievement) => achievement._id === achievementid
    );
    setClaimedAchievements([...claimedAchievements, ...temp]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );

  return (
    <Container maxWidth={"lg"} className="mx-auto">
      {/* <div className="mt-24 p-1 float-right ">
        <span className="h-10 rounded-md bg-blue-500 px-4 py-2 text-white text-center font-medium">
          Flipcoins Balance: {cryptoBalance}
        </span>
      </div> */}
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

      <ToastMessageContainer />
    </Container>
  );
};

export default Rewards;
