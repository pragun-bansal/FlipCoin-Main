import React, { useEffect, useState } from "react";
import { useReward } from "react-rewards";
import { makeStyles, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Container, CircularProgress, Typography, } from "@material-ui/core";
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';


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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


const Rewards = () => {

  const classes = useStyle();
  const { reward, isAnimating } = useReward("rewardId", "confetti", {elementCount: 100,});

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);

  // const { user,isAuthenticate } = useSelector((state) => state.userReducer);
  const user = {
    "_id": {
      "$oid": "64e067592f2b67f1c0e81fa9"
    },
    "fname": "Shivam",
    "lname": "Gupta",
    "password": "$2a$12$QIcTrEiLhxAL6rthb1iKhOImIA6olIGrkhA1CCE1MIqG3kMHfUR9m",
    "phone": 7015145611,
    "role": "admin",
    "totalOrders": 15,
    "totalAmount": 945184,
    "claimedachievements": [
      {
        "achievementId": {
          "$oid": "64e0cfce3180bd12b0734131"
        },
        "claimedDate": {
          "$date": "2023-08-19T14:37:28.477Z"
        },
        "_id": {
          "$oid": "64e0d3d9abfd8f388b82123e"
        }
      },
      {
        "achievementId": {
          "$oid": "64e0d137a1da333ed344579b"
        },
        "claimedDate": {
          "$date": "2023-08-19T14:37:28.477Z"
        },
        "_id": {
          "$oid": "64e0d3e2abfd8f388b821265"
        }
      },
      {
        "achievementId": {
          "$oid": "64e0ccfb85b8439299b785dd"
        },
        "claimedDate": {
          "$date": "2023-08-19T14:45:32.311Z"
        },
        "_id": {
          "$oid": "64e0d5a699340f591144a497"
        }
      }
    ],
    "availableachievements": [
      {
        "achievementId": {
          "$oid": "64e0d2cf58d65abfae0564a1"
        },
        "unlockDate": {
          "$date": "2023-08-19T14:45:48.803Z"
        },
        "_id": {
          "$oid": "64e0d59c99340f591144a47a"
        }
      }
    ],
    "tokens": [
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE1OTd9.l9GsTEmkxWUL-zddKZZNdOw-5ZQ3HjK3DLhbbSDmYS8",
        "_id": {
          "$oid": "64e0c30d1e3ae320de4d881f"
        }
      },
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE3ODZ9.EbBTV8QP7MWnsEX-X7caZqckMcSeRbF1qoPJE3ZWzns",
        "_id": {
          "$oid": "64e0c3ca1e3ae320de4d8850"
        }
      },
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTE5NDV9.hQpW-6iHmlD1SJJ6zu3BIMmcM4p6vWf3ttTEPmox2xM",
        "_id": {
          "$oid": "64e0c4691e3ae320de4d8871"
        }
      },
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNjc1OTJmMmI2N2YxYzBlODFmYTkiLCJpYXQiOjE2OTI0NTIwMDd9.e15itZoKXLht7uT2MsmYTC826J15My7Zmb47GECxC6Q",
        "_id": {
          "$oid": "64e0c4a71e3ae320de4d8886"
        }
      }
    ],
    "__v": 37,
    "availableCoupons": []
  }

  const isAuthenticate = true;


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
    const getTransactionHistory = async () => {
      console.log("getTransactionHistory");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const sender = new ethers.Wallet(ADMIN_PVT_KEY, provider);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, Flcabi,sender);
      const walletAddress = await signer.getAddress();
      await provider.send("eth_requestAccounts", []);
      console.log(walletAddress);

      const filter = tokenContract.filters.Transfer(walletAddress, null);
      const transferEventsSent = await tokenContract.queryFilter(filter);
      transferEventsSent.reverse();

      console.log("Fetching sent transactions")

      const tmp = [];
      transferEventsSent.forEach(async(tx) => {
        const ev = await tx.getBlock()
        const datetx = new Date(ev.timestamp*1000);
        tmp.push({
          to: tx.args.to,
          amount: ethers.utils.formatEther(tx.args.value),
          date: datetx.toLocaleString()
        });
      });

      setSentTransactions(tmp.reverse());

      const filter2 = tokenContract.filters.Transfer(null, walletAddress);
      const transferEventsReceived = await tokenContract.queryFilter(filter2);

      const tmp2 = [];
      transferEventsReceived.forEach(async(tx) => {
        const ev = await tx.getBlock()
        const datetx = new Date(ev.timestamp*1000);
        tmp2.push({
          from: tx.args.from,
          amount: ethers.utils.formatEther(tx.args.value),
          date: datetx.toLocaleString()
        });
      });

      setReceivedTransactions(tmp2.reverse());
      console.log("Fetching received transactions",receivedTransactions)

    }
    getTransactionHistory();
  }, []);


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
      <div className="flex flex-row">
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
     
     <div className="bg-white h-fit mt-24 border-gray rounded-2xl shadow-md w-[50%]">
      
          <div className="flex flex-row justify-between items-center p-4 w-full cursor-pointer border-gray-200 border-b-2">
            <div className="flex flex-row justify-between items-center w-1/2" onClick={()=>setValue(0)}>
              <p className="text-gray-800 text-lg text-center w-full border-r-2 border-gray-200">Sent Transactions</p>
            </div>
            <div className="flex flex-row justify-between items-center w-1/2" onClick={()=>setValue(1)}>
              <p className="text-gray-800 text-lg text-center w-full border-l-2 border-gray-200">Recived Transactions</p>
            </div>
          </div>
          {/* Creating a swipable view that show data according to value chosen */}
        <Box sx={{ width: '100%', height: 400, overflowY: 'scroll' }}>
          {
            value === 0 ? 
            
            <div>
            {sentTransactions.map((transaction) => (
              <div className="flex flex-row justify-between items-center p-4 border-b-2 border-gray-200">
                To: {transaction.to}
                Money: {transaction.amount}
                Date: {transaction.date}
              </div>
              ))
            }
          </div> : <div>
            {receivedTransactions.map((transaction) => (
              <div className="flex flex-row justify-between items-center p-4 border-b-2 border-gray-200">
                From: {transaction.from}
                Money: {transaction.amount}
                Date: {transaction.date}
              </div>
              ))
            }
          </div>
          }
      
        </Box>
        <div className="flex flex-row justify-between items-center p-4 w-full cursor-pointer border-gray-200 border-t-2">
          <div className="flex flex-row justify-between items-center w-full px-2 text-center text-lg">
            FLC in your wallet are {cryptoBalance}
          </div>
          </div>
        </div>
     

      </div>
      <ToastMessageContainer />
    </Container>
  );
};

export default Rewards;