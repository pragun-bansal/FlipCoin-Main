const mongoose = require("mongoose");

const achievmentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    identifier:{
        type: String,
        required: true,
    },
    minorderprice:{
        type: Number,
        required: true,
    },
    claimed: {
        type: Boolean,
        required: true,
        default: false,
    },
    minorders:{
        type: Number,
        required: true,
    },
    active:{
        type: Boolean,
        required: true,
        default: true,
    },
    reward:{
        type: Number,
        required: true,
    },
});
    
const Achievment = new mongoose.model("achievment", achievmentSchema);
module.exports = Achievment;