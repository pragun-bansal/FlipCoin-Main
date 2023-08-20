const Achievement = require("../models/achievementSchema");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const getachievements = async (req, res) => {
    try {
        const achievements = await Achievement.find();
        res.json(achievements);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

const getachievementById = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        res.json(achievement);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
}

const createachievement = async (req, res) => {
    try {
    const achievement = req.body;
    const userId = mongoose.Types.ObjectId(req.body.userId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).send(`No user with id: ${userId}`);
    const newachievement = new Achievement({ ...achievement, active: true });
    
        await newachievement.save();
        res.status(201).json(newachievement);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const updateachievement = async (req, res) => {
    try{
        const { id } = req.params;
        const { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No achievement with id: ${id}`);
        const updatedachievement = { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward, _id: id };
        const achievement = await Achievement.findByIdAndUpdate(id, updatedachievement, { new: true });
        res.json(achievement);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const redeemachievement = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(400).json({message: `No user with id: ${req.body.userId}`});
        user.availableachievements = user.availableachievements.filter((achievement) => achievement.achievementid != req.body.achievementid);
        user.claimedachievements.push({achievementid:req.body.achievementid,claimDate:Date.now()});
        await user.save();
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

module.exports= { getachievements, getachievementById, createachievement, updateachievement, redeemachievement };