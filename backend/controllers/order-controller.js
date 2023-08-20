const Order = require("../models/orderSchema");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const Achievment = require("../models/achievementSchema");

const completeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send("Invalid User");
    console.log(user);
    console.log(req.body);
    const order = new Order({ ...req.body, orderDate: Date.now() });
    user.totalOrders++;
    user.totalAmount += order.totalAmount;
    console.log("total orders", user.totalOrders);
    
    const achivids = new Set();
    user.availableachievements.forEach((achievement) => {
      achivids.add(achievement.achievementId);
    });
    user.claimedachievements.forEach((achievement) => {
      achivids.add(achievement.achievementId);
    });
    

    const achievements = await Achievment.find({});
    const useravailableachievementsids = user.availableachievements.map((achievement) => achievement.achievementId.toString()); 
    const userclaimedachievementsids = user.claimedachievements.map((achievement) => achievement.achievementId.toString());
    const newachievements = [];
    achievements.forEach((achievement) => {
      if (achievement.minorders <= user.totalOrders && achievement.minorderprice <= user.totalAmount) {
          console.log("Now check ", achievement._id.toString(),"\n")
          if(!useravailableachievementsids.includes(achievement._id.toString()) && !userclaimedachievementsids.includes(achievement._id.toString())) newachievements.push({achievementId:achievement._id,unlockDate:Date.now()});
      }
    });
    console.log(newachievements);
    user.availableachievements = user.availableachievements.concat(newachievements);
    if(req.body.couponid){
      user.availableCoupons = user.availableCoupons.map((coupon) => {
        if(coupon.couponId.toString() === req.body.couponid.toString()){
          coupon.claimed = true;
        }
        return coupon;
      });
    }
    await user.save();
  
    //     user.availableachievements.push({
    //       achievementId: achievement._id,
    //       unlockDate: Date.now(),
    //     });
    //   }
    // });

    const result = await order.save();
    res.json({ orderId: result._id });
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const uId = mongoose.Types.ObjectId(req.body.userId);
    const result = await Order.aggregate([
      {
        $match: {
          userId: uId,
          paymentStatus: "Completed",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "addressDetails",
        },
      },
      {
        $unwind: "$addressDetails",
      },
      { $sort: { orderDate: -1 } },
    ]);
    console.log("result",result)
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
};

module.exports = { completeOrder, getOrderDetails };
