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
import { BACKEND_URL, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../bkd";
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



const RewardPage = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    authentication().then((res) => {
      console.log("user: ", res);
      dispatch(setUserInfo(res.user))
    })
  }, [dispatch]);

  const classes = useStyle();
  const { reward, isAnimating } = useReward("rewardId", "confetti", {
    elementCount: 100,
  });
  const [rewards, setRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useSelector((state) => state.userReducer);
  let userid;
  if (user._id) userid = user._id;
  else userid = "64e06a77c96091c2139abc82";
  useEffect(() => {

    // if(!user.isAuthenticate){
    //   window.location.replace("/login");
    // }

    const getRewards = async () => {
  const {data }=await axios.get(`${BACKEND_URL}/coupons`);
  console.log(data)
  console.log(rewards);
  console.log(user.availableCoupons);
  setRewards(data);
  let temp = data.filter(reward =>
    user.availableCoupons.some(coupon => coupon.couponId === reward._id)
  );
      setClaimedRewards(temp);
      console.log("claimed rewards", temp);
      temp =data.filter(reward =>
        user.availableCoupons.every(coupon => coupon.couponId != reward._id)
      );
      setAvailableRewards(temp);
      console.log("available rewards", temp);
    }
    getRewards();
  },[])


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


  async function fundRequestHandler(cost) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("signer",signer)
      const contract = new ethers.Contract(TOKEN_ADDRESS,Flcabi,signer);
      console.log("contract",contract)
      console.log("cost",cost)
      const val = ethers.utils.parseEther(cost.toString());
      console.log("val",val)
      await contract.transfer(CONTRACT_ADDRESS,val);
      // setSubmitting(true);
      contract.on("Transfer", (from, to, value) => {
        toastMessage("Funds Transferred SuccessFully","success");
        // setSubmitting(false);
        // setFundValue("");
        // setReceiveAddress("");
      });
    } catch (error) {
      toastMessage("Error Occured while transferring FLC. Please try again later.","error");
      console.error("Error submitting reward batch:", error);
    }
  }

    const redeemCouponfunc = async (cost, couponid) => {
      try {
        console.log("cost",cost, "couponid", couponid)
        await fundRequestHandler(cost);

        await axios.post(`${BACKEND_URL}/couponsredeem`, {
          userid: userid,
          couponId:couponid
        });
      } catch (error) {
        console.error("Error claiming reward:", error);
      }
    };

  return (
    <Container maxWidth={"xl"} className="mt-20">
      <h1 className="text-2xl font-bold text-[#242424]  text-center py-2">
        Redeem Flipcoins
      </h1>
      <Grid container className={`mt-0 pt-0 mx-auto flex justify-center `}>
        {availableRewards.map((rew, idx) => (
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
                    redeemCouponfunc(rew.cost, rew._id);
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
                    redeemCouponfunc(rew.cost, rew._id);
                  }}
                  disabled={true}
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
        
      </Grid>

      <ToastMessageContainer />
    </Container>
  );
};

export default RewardPage;