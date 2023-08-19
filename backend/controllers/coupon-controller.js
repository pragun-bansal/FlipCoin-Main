const mongoose = require("mongoose");
const Coupon = require("../models/couponSchema");
const User = require("../models/userSchema");

const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        console.log(coupons);
        res.status(200).json(coupons);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        res.json(coupon);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

const createCoupon = async (req, res) => {
    const coupon = req.body;
    console.log(coupon);
    const newCoupon = new Coupon({ ...coupon });
    try {
        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const updateCoupon = async (req, res) => {
    try{
        const { id } = req.params;
        const { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No coupon with id: ${id}`);
        const updatedCoupon = { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward, _id: id };
        const coupon = await Coupon.findByIdAndUpdate(id, updatedCoupon, { new: true });
        res.json(coupon);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const redeemCoupons = async (req, res) => {
    try {
        console.log("entered redeem coupons")
        const userId = req.body.userid;
    const user =await User.findById(userId);
    console.log(user);
    const couponId = req.body.couponId;
    // const coupon = Coupon.findById(couponId);
    user.availableCoupons.push({
        couponId: couponId,
        lastDate: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
        claimed: false,
      });

    await user.save();
    res.status(200).json(user.availableCoupons);

    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
    

}


module.exports= { getCoupons, getCouponById, createCoupon, updateCoupon,redeemCoupons };