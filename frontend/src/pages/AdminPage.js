import React, {  useEffect, useState } from "react";
import {
  makeStyles,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Modal,
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Transactionabi from "../utils/transactionsabi.json";
import Flcabi from "../utils/flcabi.json";
import toastMessage from "../utils/toastMessage";
import { DataGrid } from '@mui/x-data-grid';
import axios from "../adapters/axios";
import { ADMIN_PVT_KEY, BACKEND_URL, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../bkd";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


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
  leftSection: {
    flex: 2,
    padding: theme.spacing(2),
  },
  rightSection: {
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: '#f4f4f4',
  },
  card: {
    width: '100%',
    maxWidth: 300,
  },
}));

const AdminPage = () => {
  const classes = useStyle();

  const [openReward, setOpenReward] = useState(false);
  const [openRedeem, setOpenRedeem] = useState(false);
  const [fundValue,setFundValue] = useState("");
  const [reciveaddress,setReceiveAddress] = useState("");
  const [submitting,setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleCoupon, setTitleCoupon] = useState("");
  const [delievery, setDelievery] = useState
  (false);
  const [percentageoff, setPercentageoff] = useState("");
  const [descriptionCoupon, setDescriptionCoupon] = useState("");
  const [maxoff, setMaxoff] = useState("");
  const [cost, setCost] = useState("");

  const [imageuri, setImageUri] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [minorderprice, setMinOrderPrice] = useState("");
  const [minorders, setMinOrders] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [requests, setRequests] = useState([]);
  const [showApproved, setShowApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rewardClaimsArray, setRewardClaimsArray] = useState([]);
  const [rewardClaims, setRewardClaims] = useState([]);

  const {user} = useSelector((state) => state.userReducer);
  let userid 
  if(user._id) userid = user._id
  else userid = "64e06a77c96091c2139abc82"

  const history = useHistory();

  if(user.role!=='admin'){
    history.push('/');
  }

  const handleChange1 = (event) => {
    console.log(delievery," to ", event.target.checked)
    setDelievery(event.target.checked);
  };

  useEffect(() => {
    const getRequests = async () => {
      const  {data}  = await axios.get(`${BACKEND_URL}/requests/${userid}`);
      setRequests(data);
      setRewardClaimsArray(data.map((req) => {
        return{
          id: req._id,
          address: req.address,
          amount: req.amount,
          approved: req.approved,
          message: req.message,
          nonce: req.nonce,
          signature: req.signature,
        }
      }));
      let temparr = [];
      rewardClaimsArray.filter((req)=>req.approved===false).forEach((req) => {
        temparr.push([req.address, req.amount,  req.nonce, req.signature, req.message]);
      })
      setRewardClaims(temparr);
      setLoading(false);
    };
    getRequests();
  }, []);

  
  const handleOpenRedeem = () => {
    setOpenRedeem(true);
  };
  
  const handleOpenReward = () => {
    setOpenReward(true);
  };

  const handleCloseRedeem = () => {
    setOpenRedeem(false);
  };
  
  const handleCloseReward= () => {
    setOpenReward(false);
  };
  
  async function submitRewardBatch() {
    setLoading(true);
    try {
        const PendingRequests = requests.filter((req)=>req.approved===false);
        if(PendingRequests.length===0){
          toastMessage("No requests to approve", "error");
          setLoading(false);
          return;
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const sender = new ethers.Wallet(ADMIN_PVT_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS,Transactionabi, sender);
        await contract.handleBatch(rewardClaims);
        axios.post(`${BACKEND_URL}/requests/approveBatch`,{ inputs: requests.filter((req)=>req.approved===false)}).then(
          async (res) => {
            const  {data}  = await axios.get(`${BACKEND_URL}/requests/${userid}`);
            setRequests(data);
            setRewardClaimsArray(data.map((req) => {
              return{
                id: req._id,
                  address: req.address,
                  amount: req.amount,
                  approved: req.approved,
                  message: req.message,
                  nonce: req.nonce,
                  signature: req.signature,
                }
            }));
            let temparr = [];
            rewardClaimsArray.filter((req)=>req.approved===false).forEach((req) => {
              temparr.push([req.address, req.amount,  req.nonce, req.signature, req.message]);
            })
            setRewardClaims(temparr);
            toastMessage("Reward Batch Submitted Successfully","success");
            setLoading(false);

          }
        )
    } catch (error) {
      toastMessage("Error Occured while approving requests. Please try again later.","error");
      console.log("error", error);  
      setLoading(false);
    }
  }

  async function fundRequestHandler() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS,Flcabi,signer);
      const val = ethers.utils.parseEther(fundValue);
      await contract.transfer(reciveaddress,val);
      setSubmitting(true);
      contract.on("Transfer", (from, to, value) => {
        toastMessage("FLC transferred successfully.","success");
        setSubmitting(false);
        setFundValue("");
        setReceiveAddress("");
      });
    } catch (error) {
      toastMessage("Error Occured while transferring FLC. Please try again later.","error");
      console.error("Error submitting reward batch:", error);
    }
  }

  const createachievement = async () => {
    console.log("createachievement");
    try {
      axios.post(`${BACKEND_URL}/achievements/add`, {
        title: title,
        description: description,
        image: imageuri,
        identifier: identifier,
        minorders: minorders,
        minorderprice: minorderprice,
        reward: rewardAmount,
        userId: userid,
      });
      toastMessage("Achievement Created Successfully","success");
      setTitle("");
      setDescription("");
      setImageUri("");
      setIdentifier("");
      setMinOrderPrice("");
      setMinOrders("");
      setRewardAmount("");
      handleCloseReward();
    } catch (error) {
      console.log(error);
    }
  }


  const createCoupon = async () => {
    console.log("createCoupon");
    try {
      axios.post(`${BACKEND_URL}/coupons/add`, {
        title: titleCoupon,
        description: descriptionCoupon,
        percentageoff:percentageoff,
        maxoff:maxoff,
        delievery:delievery,
        cost:cost
      });
      toastMessage("Achievement Created Successfully","success");
      setTitleCoupon("");
      setDescriptionCoupon("");
      setPercentageoff("");
      setMaxoff("");
      setDelievery(false);
      setCost("");
      handleCloseReward();
    } catch (error) {
      console.log(error);
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'address', headerName: 'User Address', width: 200 },
    { field: 'amount', headerName: 'FLC', width: 80 },
    { field: 'nonce', headerName: 'Nonce',width: 90 },
    { field: 'message', headerName: 'Message',width: 160,},
    { field: 'signature', headerName: 'Signature',width: 160,},
  ];
  

  if(loading) return(
    <div className="flex justify-center items-center h-screen">
      <CircularProgress />
    </div>
  )


  return (
    <div>
  
    <Grid container className={classes.component}>
      <div className={classes.leftSection}>
       {!showApproved ?<DataGrid
          rows={rewardClaimsArray.filter((req) => req.approved === false)}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            }, 
          }}
          pageSizeOptions={[5,10,15]}
          disableRowSelectionOnClick
          className={"bg-white rounded-xl shadow-xl border-2 border-gray-200"}
        />
        :<DataGrid
          rows={rewardClaimsArray.filter((req) => req.approved === true)}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            }, 
          }}
          pageSizeOptions={[5,10,15]}
          disableRowSelectionOnClick
          className={"bg-white rounded-xl shadow-xl border-2 border-gray-200"}
        />
        }
        <br />
      </div>
      <div className={classes.rightSection}>


        <Card className="rounded-2xl shadow-lg w-[100%] mx-auto border-2 border-gray-200">
          <CardContent className="flex flex-col gap-y-6">
            <TextField
              id="outlined-basic"
              label="Amount"
              variant="outlined"
              value={fundValue}
              onChange={(e) => setFundValue(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Receiver address"
              variant="outlined"
              value={reciveaddress}
              onChange={(e) => setReceiveAddress(e.target.value)}
            />
            <div className="flex flex-row justify-between cursor-pointer" onClick={()=>setReceiveAddress("0xb97e2EF23af04418fD2De96887F3310C11434506")}>
              Tranfer to Contract
            </div>
          <Button variant="contained" color="primary" onClick={fundRequestHandler} disabled={submitting}>
            {submitting?<CircularProgress color="gray"/> :"Fund Now"}
          </Button>
            </CardContent>
        </Card>

        <div className="w-full flex flex-row items-center">
          <Button variant="contained" color="primary" onClick={submitRewardBatch} className="!mx-auto !my-6 !text-md !px-2 !py-4" >
            Approve all Requests
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpenReward} className="!mx-auto !my-6 !text-md !px-2 !py-4" >
            Create New Achievment
          </Button>
        </div>

        <div className="w-full flex flex-row items-center">
        <Button variant="contained" color="primary" onClick={handleOpenRedeem} className="!mx-auto !my-6 !text-md !px-2 !py-4" >
            Create New Coupon
          </Button>
        </div>
        <div className="w-full flex flex-row items-center">
          <Button variant="contained" color="primary" onClick={()=>setShowApproved(!showApproved)} className="!mx-auto !my-6 !text-md !px-2 !py-4" >
            {showApproved ? "Show Pending" : "Show Approved"}
          </Button>
        </div>
        


      </div>
      <Modal
        open={openReward}
        onClose={handleCloseReward}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
          sx  = {{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            border: '2px solid #888',
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* Creating a form */}
          <h2 className="text-2xl font-bold mb-6 text-center">Create New Achievment</h2>
          <div className="flex flex-col gap-y-4">
            <TextField id="title" label="Title" variant="outlined" onChange={(e)=>setTitle(e.target.value)}/>
            <TextField id="description" label="Description" variant="outlined" multiline onChange={(e)=>setDescription(e.target.value)}/>
            <TextField id="reward" label="Reward FLC" variant="outlined" onChange={(e)=>setRewardAmount(e.target.value)}/>
            <TextField id="imguri" label="Image URL" variant="outlined" onChange={(e)=>setImageUri(e.target.value)}/>
            <TextField id="identifier" label="Identifier" variant="outlined" onChange={(e)=>setIdentifier(e.target.value)} />
            <TextField id="minorderprice" label="Minimum Order Price" variant="outlined" onChange={(e)=>setMinOrderPrice(e.target.value)} />
            <TextField id="minorder" label="Minimum Orders" variant="outlined" onChange={(e)=>setMinOrders(e.target.value)}/>
          </div>
          <div className="flex flex-row justify-center mt-4">
            <Button variant="contained" color="primary" className="!px-10 !py-2" onClick={createachievement}>Create Now</Button>
          </div>         
        </Box>
      </Modal>

      <Modal
        open={openRedeem}
        onClose={handleCloseRedeem}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
          sx  = {{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            border: '2px solid #888',
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* Creating a form */}
          <h2 className="text-2xl font-bold mb-6 text-center">Create Coupon</h2>
          <div className="flex flex-col gap-y-4">
            <TextField id="title" label="Title" variant="outlined" onChange={(e)=>setTitleCoupon(e.target.value)}/>
            <TextField id="descriptionCoupon" label="Description Coupon" variant="outlined" multiline onChange={(e)=>setDescriptionCoupon(e.target.value)}/>
            <TextField id="percentageOff" label="percentageOff" variant="outlined" onChange={(e)=>setPercentageoff(e.target.value)}/>
            <TextField id="maxoff" label="MaxOff" variant="outlined" onChange={(e)=>setMaxoff(e.target.value)} />
            <TextField id="cost" label="Cost" variant="outlined" onChange={(e)=>setCost(e.target.value)} />
            <FormControlLabel
        id="delievery" label="delievery" 
        control={<Checkbox checked={delievery} onChange={handleChange1} />}
      />
          </div>
          <div className="flex flex-row justify-center mt-4">
            <Button variant="contained" color="primary" className="!px-10 !py-2" onClick={createCoupon}>Create Now</Button>
          </div>         
        </Box>
      </Modal>

    </Grid>

      <ToastMessageContainer />
    </div>
  );
};

export default AdminPage;
