const Order = require("../models/orderSchema");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const Achievment = require("../models/achievementSchema");

const completeOrder = async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid User");
  try {
    const order = new Order({ ...req.body, orderDate: Date.now() });
    user.totalOrders++;
    user.totalAmount += order.totalAmount;
    
    // // Appending all unlocked achivemtn to user available achievements
    // appneding all avaiabe and claimed achivmets to set
    const achivids = new Set();
    user.availableachievements.forEach((achievement) => {
      achivids.add(achievement.achievementId);
    });
    user.claimedachievements.forEach((achievement) => {
      achivids.add(achievement.achievementId);
    });

    const achievements = Achievment.find({});
    const newachievements = [];
    achievements.forEach((achievement) => {
      if (achievement.minorders <= user.totalOrders && achievement.minorderprice <= user.totalAmount) {
          if(!achivids.has(achievement._id))newachievements.push({achievementId:achievement._id,unlockDate:Date.now()});
      }
    });
    user.availableachievements = user.availableachievements.concat(newachievements);
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
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
};

module.exports = { completeOrder, getOrderDetails };
