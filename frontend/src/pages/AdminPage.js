import React, {  useState } from "react";
import {
  makeStyles,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import ToastMessageContainer from "../components/ToastMessageContainer";
import { ethers } from "ethers";
import Transactionabi from "../utils/transactionsabi.json";
import Flcabi from "../utils/flcabi.json";
import toastMessage from "../utils/toastMessage";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

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
  const [fundValue,setFundValue] = useState("");
  const [reciveaddress,setReceiveAddress] = useState("");
  const [submitting,setSubmitting] = useState(false);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'address', headerName: 'User Address', width: 200 },
    { field: 'amount', headerName: 'FLC', width: 80 },
    { field: 'nonce', headerName: 'Nonce',width: 90 },
    { field: 'messageHash', headerName: 'Message Hash',width: 160,},
    { field: 'signature', headerName: 'Signature',width: 160,},
  ];
  

  
  const rewardClaims =
   [
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ],
    [
      "0x1Ba1803B940Fa64C1cDc5EBa942b62C4bB8Cc2D4",
      42,
      923943,
       "0x29ccc84ff2e07d104db5bbef2be1daf12b2a71842d5d52145f989c55a1568ad471b36f007e818dcf897bbcd34c679c4057a10686c6f39e32fdab2c76ecaf44b81b",
       "0x19a0f76fa83956ec42c78759d28f52253d2067cf8298a8fc2a2c165038e9d82d"
    ]
  ];

  const rewardClaimsArray = rewardClaims.map((claim,index) => {
    return {
      id: index+1,
      address: claim[0],
      amount: claim[1],
      nonce: claim[2],
      messageHash: claim[3],
      signature: claim[4],
    };
  });

  async function submitRewardBatch() {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const privateKey = "8d1444ef95f13c8d0713e4319463d8d24316940a21a9624b81978d84c6c616f3"; // Admin's private key
        const sender = new ethers.Wallet(privateKey, provider);
        const contractAddress = "0xb97e2EF23af04418fD2De96887F3310C11434506";
        const contract = new ethers.Contract(contractAddress,Transactionabi, sender);
        await contract.handleBatch(rewardClaims);
    } catch (error) {
      console.error("Error submitting reward batch:", error);
    }
  }

  async function fundRequestHandler() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const privateKey ="8d1444ef95f13c8d0713e4319463d8d24316940a21a9624b81978d84c6c616f3"; // Admin's private key
      // const sender = new ethers.Wallet(privateKey, provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract("0xc1c62B3f6Ba557233f4Fe93C0e824Ae04234666F",Flcabi,signer);
      console.log("contract",contract);
      
      const val = ethers.utils.parseEther(fundValue);
      console.log("val",val);

      try{
        await contract.transfer(reciveaddress,val);
      } catch(error){
        toastMessage("Error Occured while transferring FLC. Please try again later.","error");
        console.log("error",error);
      }

      setSubmitting(true);
      contract.on("Transfer", (from, to, value) => {
        toastMessage("FLC transferred successfully.","success");
        setSubmitting(false);
        setFundValue("");
        setReceiveAddress("");
      });

    } catch (error) {
      console.error("Error submitting reward batch:", error);
    }
  }

 

  return (
    <div>
    
   

    <Grid container className={classes.component}>
      <div className={classes.leftSection}>
        <DataGrid
          rows={rewardClaimsArray}
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
          <Button variant="contained" color="primary" onClick={submitRewardBatch} className="!mx-auto !my-6 !text-md !px-6 !py-4" >
            Approve all Requests
          </Button>
        </div>


      </div>
    </Grid>

      <ToastMessageContainer />
    </div>
  );
};

export default AdminPage;
