const Coupon = require("../models/couponSchema");
const mongoose = require("mongoose");

const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
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
    const newCoupon = new Coupon({ ...coupon, claimed: false, active: true });
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

module.exports= { getCoupons, getCouponById, createCoupon, updateCoupon };