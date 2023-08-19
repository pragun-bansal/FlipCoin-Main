import React, { useState, useEffect } from "react";
import { Box, makeStyles, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { setTotalAmount } from "../../actions/orderActions";

import { BACKEND_URL, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../../bkd";
import authentication from "../../adapters/authentication";
import { setUserInfo } from "../../actions/userActions";
import axios from "axios";




const useStyle = makeStyles({
  header: {
    padding: "15px 24px",
    background: "#fff",
  },
  greyTextColor: {
    color: "#878787",
  },
  container: {
    "& > *": {
      marginBottom: 20,
      fontSize: 14,
    },
  },
  price: {
    float: "right",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 600,
    borderTop: "1px dashed #e0e0e0",
    padding: "20px 0",
    borderBottom: "1px dashed #e0e0e0",
  },
});

const TotalView = ({ page = "cart" }) => {
  // const [user, setUser] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    authentication().then((res) => {
      console.log("user: ", res);
      dispatch(setUserInfo(res.user))
    })
  }, [dispatch]);
  const classes = useStyle();
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(50);
  const { cartItems, stateChangeNotifyCounter } = useSelector(
    (state) => state.cartReducer
  );

  const { user } = useSelector((state) => state.userReducer);
  console.log(user)

  // const user = {
  //   "_id": {
  //     "$oid": "64e06a77c96091c2139abc82"
  //   },
  //   "fname": "Pragun",
  //   "lname": "Bansal",
  //   "password": "$2a$12$7l12zDb6S2BMlpr8w2gdBO.QyS6l7wSPunuIU7Rpqib09AsF2STt6",
  //   "phone": 9811144328,
  //   "role": "admin",
  //   "totalOrders": 4,
  //   "totalAmount": 166486,
  //   "claimedachievements": [
  //     {
  //       "achievementId": {
  //         "$oid": "64e0ccfb85b8439299b785dd"
  //       },
  //       "claimedDate": {
  //         "$date": "2023-08-19T15:00:13.870Z"
  //       },
  //       "_id": {
  //         "$oid": "64e0dbd6b006ffbeae437d2a"
  //       }
  //     },
  //     {
  //       "achievementId": {
  //         "$oid": "64e0d2cf58d65abfae0564a1"
  //       },
  //       "claimedDate": {
  //         "$date": "2023-08-19T15:00:13.870Z"
  //       },
  //       "_id": {
  //         "$oid": "64e0dc18b006ffbeae437d79"
  //       }
  //     },
  //     {
  //       "achievementId": {
  //         "$oid": "64e0cfce3180bd12b0734131"
  //       },
  //       "claimedDate": {
  //         "$date": "2023-08-19T16:21:55.233Z"
  //       },
  //       "_id": {
  //         "$oid": "64e0f002532e2ae6e8692a42"
  //       }
  //     },
  //     {
  //       "achievementId": {
  //         "$oid": "64e0d137a1da333ed344579b"
  //       },
  //       "claimedDate": {
  //         "$date": "2023-08-19T16:21:55.233Z"
  //       },
  //       "_id": {
  //         "$oid": "64e0f044532e2ae6e8692a9d"
  //       }
  //     }
  //   ],
  //   "availableachievements": [],
  //   "tokens": [
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0Mjg5MTl9.RYkgyvBDK4wNbfDSm6ertJ0Qlvl3basVHj1RDWTO7TE",
  //       "_id": {
  //         "$oid": "64e06a77c96091c2139abc83"
  //       }
  //     },
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0Mjg5Mjh9.cobu-zcDxMfwMVMQy1TlfrMSglsHJGJGOa6npHxF2s4",
  //       "_id": {
  //         "$oid": "64e06a80c96091c2139abc8a"
  //       }
  //     },
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0Mjg5NjJ9.AHdOMfyGt5V4FgviJ-zwfiLmtIKCYXujKDyp_dg-4TI",
  //       "_id": {
  //         "$oid": "64e06aa2c96091c2139abc92"
  //       }
  //     },
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0Mjg5ODR9.MgeSUrclsSiVIycUEuAe5PgGU6WviZ05d_1u5OWmB80",
  //       "_id": {
  //         "$oid": "64e06ab8c96091c2139abc9c"
  //       }
  //     },
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0MjkwNzV9.z1_FoQwIhRxt7ETDLDWft6qi17f6OlfaeCLRNhmcyys",
  //       "_id": {
  //         "$oid": "64e06b13c96091c2139abca8"
  //       }
  //     },
  //     {
  //       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGUwNmE3N2M5NjA5MWMyMTM5YWJjODIiLCJpYXQiOjE2OTI0ODA3MTd9.r7AT_O8cIkndNI4BiQ2uFKupuz8JcMoMNPHa7cbEV8Y",
  //       "_id": {
  //         "$oid": "64e134cd161ab31aacbd0a35"
  //       }
  //     }
  //   ],
  //   "__v": 30,
  //   "availableCoupons": [
  //     {
  //       "couponId": {
  //         "$oid": "64e0ee1f532e2ae6e8692a07"
  //       },
  //       "lastDate": {
  //         "$date": "2023-08-29T17:45:14.425Z"
  //       },
  //       "claimed": false,
  //       "_id": {
  //         "$oid": "64e0ffaaf60f870f15250955"
  //       }
  //     },
  //     {
  //       "couponId": {
  //         "$oid": "64e0fdac532e2ae6e8692b7d"
  //       },
  //       "lastDate": {
  //         "$date": "2023-08-29T18:19:54.422Z"
  //       },
  //       "claimed": false,
  //       "_id": {
  //         "$oid": "64e107ca161ab31aacbd0855"
  //       }
  //     }
  //   ]
  // }

const [rewards,setRewards] = useState([]);
const [availableRewards,setAvailableRewards] = useState([]);
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
  setAvailableRewards(temp);
  
      console.log("available rewards", temp);
    }
    getRewards();
  },[])

  const [coupon, setCoupon] = useState();

  const handleCouponChange = (event) => {
    setCoupon(event.target.value);
    console.log(event.target.value);
  };


  useEffect(() => {
    totalAmount();
  }, [cartItems, stateChangeNotifyCounter]);

  const totalAmount = () => {
    let price = 0,
      discount = 0;
    cartItems.map((item) => {
      price += item.price.mrp * item.qty;
      discount += (item.price.mrp - item.price.cost) * item.qty;
    });

    if(coupon){
      console.log(coupon)
      if(coupon.delievery){
        setDeliveryCharges(0);
      }
      else{
        discount += coupon.percentageoff*price>coupon.maxoff?coupon.maxoff:coupon.percentageoff*price;
        setDeliveryCharges(price - discount > 5000 ? 0 : 50);
      }
    }
    

    setPrice(price);
    setDiscount(discount);
   

    if (page === "checkout") {
      dispatch(setTotalAmount(price - discount + deliveryCharges));
    }
  };



  return (
    <Box>
      <Box
        className={classes.header}
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <Typography className={classes.greyTextColor}>PRICE DETAILS</Typography>
      </Box>
      <Box className={clsx(classes.header, classes.container)}>
        <Typography>
          Price ({cartItems?.length} item)
          <span className={classes.price}>₹{price}</span>
        </Typography>
        {page === "cart" && (
          <Typography>
            Discount<span className={classes.price}>-₹{discount}</span>
          </Typography>
        )}
        <Typography>
          Delivery Charges
          <span className={classes.price}>
            {deliveryCharges > 0 ? "₹40" : "FREE"}{" "}
          </span>
        </Typography>
        <Typography className={classes.totalAmount}>
          {page === "checkout" ? "Total Payable" : "Total Amount"}
          <span className={classes.price}>
            ₹{price - discount + deliveryCharges}
          </span>
        </Typography>
        <Typography style={{ fontSize: 16, color: "green" }}>
          You will save ₹{discount - deliveryCharges} on this order
        </Typography>

        <div>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={coupon}
          onChange={handleCouponChange}
          label="Coupon"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {availableRewards.map((coup) =>  (<MenuItem value={coup}>{coup.title}</MenuItem>))}
        </Select>
      </FormControl>
      
    </div>
      </Box>
    </Box>
  );
};

export default TotalView;
