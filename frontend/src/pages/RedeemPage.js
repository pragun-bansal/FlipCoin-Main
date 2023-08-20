import React, { useEffect, useState } from "react";
import {Grid,Container, CircularProgress,} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Flcabi from "../utils/flcabi.json";
import {  AiOutlineCheckCircle } from "react-icons/ai";
import axios from "../adapters/axios";
import { BACKEND_URL, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../bkd";
import { useDispatch, useSelector } from "react-redux";
import toastMessage from "../utils/toastMessage";
import authentication from "../adapters/authentication";
import { setUserInfo } from "../actions/userActions";




const RewardPage = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    authentication().then((res) => {
      dispatch(setUserInfo(res.user))
    })
  }, [dispatch]);

  const [rewards, setRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user,isAuthenticate } = useSelector((state) => state.userReducer);
  let userid;
  if (user._id) userid = user._id;
  else userid = "64e06a77c96091c2139abc82";
  useEffect(() => {

    if(!isAuthenticate){
      window.location.replace("/login");
    }

    const getRewards = async () => {
    const {data }=await axios.get(`${BACKEND_URL}/coupons`);
    setRewards(data);
    let temp = data.filter(reward =>
      user.availableCoupons.some(coupon => coupon.couponId === reward._id)
    );
    setClaimedRewards(temp);
    temp =data.filter(reward =>
      user.availableCoupons.every(coupon => coupon.couponId != reward._id)
    );
    setAvailableRewards(temp);
      
    }
    getRewards();
  },[])


  // user state from redux

 


  async function fundRequestHandler(cost) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS,Flcabi,signer);
      const val = ethers.utils.parseEther(cost.toString());
      await contract.transfer(CONTRACT_ADDRESS,val);
      setLoading(true);
      contract.on("Transfer", (from, to, value) => {
        toastMessage("Funds Transferred SuccessFully","success");
        setLoading(false);
      });
    } catch (error) {
      toastMessage("Error Occured while transferring FLC. Please try again later.","error");
      console.error("Error submitting reward batch:", error);
      setLoading(false);
    }
  }

    const redeemCouponfunc = async (cost, couponid) => {
      try {
        await fundRequestHandler(cost);

        await axios.post(`${BACKEND_URL}/couponsredeem`, {
          userid: userid,
          couponId:couponid
        });
      } catch (error) {
        console.error("Error claiming reward:", error);
      }
    };

  
    if(loading) return(
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    )

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
                  className="py-4 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center gap-2 "
                  onClick={() => {
                    redeemCouponfunc(rew.cost, rew._id);
                  }}
                  disabled={true}
                >
                  
                    {/* <div id="rewardId" className="w-full h-full ">
                      Redeem Coupon
                      <p className=" ">({rew.cost} FLC)</p>
                    </div> */}
                    <AiOutlineCheckCircle size={30}/>
                  
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