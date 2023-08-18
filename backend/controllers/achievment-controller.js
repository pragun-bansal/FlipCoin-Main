const Achievment = require("../models/achievmentSchema");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const getAchievments = async (req, res) => {
    try {
        const achievments = await Achievment.find();
        res.json(achievments);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

const getAchievmentById = async (req, res) => {
    try {
        const achievment = await Achievment.findById(req.params.id);
        res.json(achievment);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
}

const createAchievment = async (req, res) => {
    const achievment = req.body;
    const userId = mongoose.Types.ObjectId(req.body.userId);
    console.log(req.body);
    const user = await User.findById(userId);
    console.log(user);
    if (!user) return res.status(404).send(`No user with id: ${userId}`);
    const newAchievment = new Achievment({ ...achievment, claimed: false, active: true });
    try {
        await newAchievment.save();
        res.status(201).json(newAchievment);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

const updateAchievment = async (req, res) => {
    try{
        const { id } = req.params;
        const { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No achievment with id: ${id}`);
        const updatedAchievment = { title, description, image, identifier, minorderprice, claimed, minorders, active, lastdate, reward, _id: id };
        const achievment = await Achievment.findByIdAndUpdate(id, updatedAchievment, { new: true });
        res.json(achievment);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

module.exports= { getAchievments, getAchievmentById, createAchievment, updateAchievment };