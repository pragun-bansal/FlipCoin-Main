const mongoose = require("mongoose");
const couponSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    percentageoff:{
        type: Number,
        required: true,
    },
    maxoff:{
        type: Number,
        required: true,
    },
    delivery:{
        type: Boolean,
        required: true,
    }
});

const Coupon = new mongoose.model("coupon", couponSchema);
module.exports = Coupon;