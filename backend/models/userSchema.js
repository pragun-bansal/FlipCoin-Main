const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
  },
  gender: String,
  email: String,
  claimedAchivements: [{
      achivementId: {
        type: mongoose.Schema.ObjectId,
        ref: "achievment",
        required: true,
      },
      claimedDate: {
        type: Date,
        default: Date.now(),
      },
  }],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avaiableCoupons: [{
      couponId: {
        type: mongoose.Schema.ObjectId,
        ref: "coupon",
        required: true,
      },
      lastDate: {
        type: Date,
        required: true, // current date + 10 days
        default: Date.now()+10*24*60*60*1000,
      },
      claimed:{
        type: Boolean,
        required: true,
      }
  }],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  try {
    //create Token
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    //Store created token into database
    this.tokens = this.tokens.concat([{ token: token }]);
    await this.save();
    return token;
  } catch (error) {
    throw error;
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      throw error;
    }
  }
  next();
});

const User = new mongoose.model("user", userSchema);

module.exports = User;
