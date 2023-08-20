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

const TotalView = ({ page = "cart",setCouponId,couponId }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    authentication().then((res) => {
      dispatch(setUserInfo(res.user))
    })
  }, [dispatch]);
  const classes = useStyle();
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const { cartItems, stateChangeNotifyCounter } = useSelector((state) => state.cartReducer);
  const [rewards,setRewards] = useState([]);
  const [availableRewards,setAvailableRewards] = useState([]);
  const [coupon, setCoupon] = useState("None");
  
  const { user } = useSelector((state) => state.userReducer);


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
          user.availableCoupons.some(tmp => tmp.couponId === reward._id && tmp.claimed===false)
        );
        setAvailableRewards(temp);     
      }
      getRewards();
    },[])


  const handleCouponChange = (event) => {
    console.log("event hai", event.target.value);
    let tmpcoupon = availableRewards.find(tmp => tmp.title === event.target.value);
    // let tmpcoupon = event.target.value;
    if(tmpcoupon === undefined){
      tmpcoupon = {title:"None",description:"",percentageoff: 0,maxoff: 0, delievery:false,cost:0,_id:""};
    }

    setCoupon(tmpcoupon.title);
    if(setCouponId)setCouponId(tmpcoupon._id);

    // const parsedObject = event.target.value;
    // setCoupon(prevCoupon => ({...prevCoupon,_id:parsedObject._id, }));
    // console.log("coupon hai", coupon,{...parsedObject});
    let pr = 0;
    let discount_bubble = 0;
    console.log("coupon hai", coupon);
    console.log("price hai and discount hai abhi", pr, discount);
    cartItems.forEach(item => {
      pr += item.price.mrp * item.qty;
      discount_bubble += (item.price.mrp - item.price.cost) * item.qty;
    });

    if(tmpcoupon.delievery){
      setDeliveryCharges(0);
    } else{
      console.log("milna chahiye", tmpcoupon.percentageoff*pr, tmpcoupon.maxoff);
      discount_bubble += tmpcoupon.percentageoff*pr>tmpcoupon.maxoff?tmpcoupon.maxoff:tmpcoupon.percentageoff*pr;
      setDeliveryCharges(pr - discount > 5000 ? 0 : 50);
    }

    setPrice(pr);
    setDiscount(discount_bubble);

    console.log("price hai and discount hai abhi4 ", pr, discount_bubble);
    if (page === "checkout") {
      dispatch(setTotalAmount(pr - discount_bubble + (pr - discount > 5000 ? 0 : 50)));
    }
  };


  useEffect(() => {
    const totalAmount = () => {
      let pr = 0;
      let disc = 0;
      cartItems.map((item) => {
        pr += item.price.mrp * item.qty;
        disc += (item.price.mrp - item.price.cost) * item.qty;
        
      });
      
      setPrice(pr);
      setDiscount(disc);
      setDeliveryCharges(pr - disc > 5000 ? 0 : 50);
      console.log("price hai and discount hai abhi2", pr, disc, (pr - disc > 5000 ? 0 : 50));
      if (page === "checkout") {
        dispatch(setTotalAmount(pr - disc + (pr - disc > 5000 ? 0 : 50)));
      }
    };
    totalAmount();
  }, [cartItems, stateChangeNotifyCounter]);



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
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} className='w-full'>
        <InputLabel id="demo-simple-select-standard-label">Select Coupon</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={coupon}
          onChange={handleCouponChange}
          label="Coupon"
        >
          <MenuItem value={"None"}>
            <em>{"None"}</em>
          </MenuItem>
          {availableRewards.map((coup) =>  (<MenuItem key={coup.title} value={coup.title}>{coup.title}</MenuItem>))}
        </Select>
      </FormControl>
      
    </div>
      </Box>
    </Box>
  );
};

export default TotalView;
