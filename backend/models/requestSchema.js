const mongoose = require("mongoose");

const requestsSchema = mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    nonce: {
        type: String,
        required: true,
    },
    messageHash: {
        type: String,
        required: true,
    },
    signature: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        required: true,
        default: false,
    },
    userid: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
});

const Requests = new mongoose.model("requests", requestsSchema);
module.exports = Requests;
