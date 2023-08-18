const mongoose = require("mongoose");
const Requests = require("../models/requestSchema");
const User = require("../models/userSchema");

const getRequests = async (req, res) => {
    const userID = req.params.userid;
    console.log("request: " ,userID);
    const user = await User.findById(userID);
    if (!user) return res.status(404).send(`No user with id: ${userID}`);
    if(user.role !== "admin") return res.status(403).send(`User with id: ${userID} is not an admin`);
    try {
        const requests = await Requests.find({});
        res.json(requests);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
}


const approveRequest = async (req, res) => {
    const userID = req.params.userid;
    const user = await User.findById(userID);
    if (!user) return res.status(404).send(`No user with id: ${userID}`);
    if(user.role !== "admin") return res.status(403).send(`User with id: ${userID} is not an admin`);
    try {
        const request = await Requests.findById(req.params.reqid);
        if (!request) return res.status(404).send(`No request with id: ${req.params.id}`);
        const updatedRequest = { ...request, approved: true };
        // update requst in mongoDB
        await Requests.findByIdAndUpdate(req.params.reqid, updatedRequest, { new: true });
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const createRequest = async (req, res) => {
    const userid = req.body.userid;
    const user = await User.findById(userid);
    if (!user) return res.status(404).send(`No user with id: ${userid}`);
    const newRequest = new Requests({ ...req.body, approved: false });
    try {
        await newRequest.save();
        res.status(201).json(newRequest);
    }
    catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}


module.exports = { getRequests, approveRequest,createRequest };