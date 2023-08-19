const mongoose = require("mongoose");
const Achievment = require("../models/achievementSchema");
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
        console.log("requests: " ,requests);
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

const approveBatchRequests = async (req, res) => {
    try {
        const inputarr = req.body.inputs;
        inputarr.forEach(async (input) => {
            const user = await User.findById(input.userid);
            if (!user) return res.status(400).send(`No user with id: ${input.userid}`);
            const request = await Requests.findById(input._id);
            if (!request) return res.status(400).send(`No request with id: ${input._id}`);
            request.approved = true;
            await request.save();
        });
        res.status(200).json({message: "All requests approved"});


    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}


const createRequest = async (req, res) => {
    try {
        const userid = req.body.userid;
        const user = await User.findById(userid);
        if (!user) return res.status(404).send(`No user with id: ${userid}`);
        const newRequest = new Requests({ ...req.body, approved: false });
        const achievement = await Achievment.findById(req.body.achievementid);
        user.claimedachievements.push({ achievementId: achievement._id, unlockDate: Date.now() });
        user.availableachievements = user.availableachievements.filter((achievement) => achievement.achievementId != req.body.achievementid);
        await user.save();
        console.log("user: ", user);
        await newRequest.save();
        res.status(201).json(newRequest);
    }
    catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}


module.exports = { getRequests, approveRequest,createRequest,approveBatchRequests };