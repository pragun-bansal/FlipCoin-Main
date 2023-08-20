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

  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticate } = useSelector((state) => state.userReducer);
  
  let userid;
  if (user._id) userid = user._id;

  const dispatch = useDispatch();
  const history = useHistory();

  if (!isAuthenticate) {
    toastMessage("Please login to enter Flipkart Rewards", "error");
    history.push("/login");
  }

  useEffect(() => {
    authentication().then((res) => {
      dispatch(setUserInfo(res.user));
    });
  }, []);

  useEffect(() => {
    const getAchievments = async () => {
      let { data } = await axios.get(`${BACKEND_URL}/achievements`);
      data = data.filter((achievement) => achievement.active);

      const useravailableachievementsids = user.availableachievements.map(
        (achievement) => achievement.achievementId
      );
      let temp = data.filter((achievement) =>
        useravailableachievementsids.includes(achievement._id)
      );
      setAvailableAchievements(temp);
      const userclaimedachievementsids = user.claimedachievements.map(
        (achievement) => achievement.achievementId
      );
      temp = data.filter((achievement) =>
        userclaimedachievementsids.includes(achievement._id)
      );
      setClaimedAchievements(temp);

      temp = data.filter(
        (achievement) =>
          !(
            useravailableachievementsids.includes(achievement._id) ||
            userclaimedachievementsids.includes(achievement._id)
          )
      );
      setLockedAchievements(temp);
      setLoading(false);
    };
    setLoading(true);
    try {
      getAchievments();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toastMessage("Error fetching achievements", "error");
    }
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
      setLoading(true);

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
      setLoading(false);
      toastMessage("Reward claimed successfully. Points will be credited to your account within 24hrs", "success");
      authentication().then((res) => {
        dispatch(setUserInfo(res.user));
      }).then(() => {
          window.location.reload();
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      setLoading(false);
    }

    // const temp = availableAchievements.filter((achievement) => achievement._id === achievementid);
    // setClaimedAchievements([...claimedAchievements, ...temp]);
  };

  if (loading){
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

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
           
            </div>
          </div>
        ))}
      </Grid>

      <ToastMessageContainer />
    </Container>
  );
};

export default Rewards;
