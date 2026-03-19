const User = require("../models/users");
const Conversation = require("../models/conversation");
const OtpGenerator = require("../utils/otpGenerator");
const Response = require("../utils/responseHandller");
const { sendEmailOTP } = require("../services/emailService");
const { sendNumberOTP, verifNumberyotp } = require("../services/twilloService");
const generateToken = require("../utils/genrateToken");
const {
  uploadfiletocloudinary,
  multerMiddleware,
} = require("../config/imageCloud");

// Send otp
const sendOtp = async (req, res, next) => {
  const { phoneNumber, phoneSuffix, email } = req.body;

  const otp = OtpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      await sendEmailOTP(email, otp);
      return Response(res, 200, "otp sent successfully to your email", {
        email,
      });
    }
    if (!phoneNumber || !phoneSuffix) {
      return Response(res, 400, "Please provide phone number and suffix", {
        email,
      });
    }
    const fullphoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix });
    }
    await sendNumberOTP(fullphoneNumber);
    await user.save();

    return Response(res, 200, "Otp Sent Successfully");
  } catch (error) {
    console.error("Error on Otp Sent: ", error);
    return Response(res, 500, "Internal Server Error");
  }
};

//verify otp

const verifyotp = async (req, res, next) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  let user;
  try {
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return Response(res, 400, "User not found");
      }
      if (user.emailOtp !== otp) {
        return Response(res, 400, "Invalid OTP");
      }
      if (user.emailOtpExpiry < Date.now()) {
        return Response(res, 400, "OTP expired");
      }
      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return Response(res, 400, "Please provide phone number and suffix");
      }
      const fullphoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });
      if (!user) {
        return Response(res, 400, "User not found");
      }
      const result = await verifNumberyotp(fullphoneNumber, otp);
      if (!result || result.status !== "approved") {
        return Response(res, 400, "Invalid OTP");
      }
      user.isVerified = true;
      const saveuser = await user.save();
      console.log("this is my save user", saveuser);
    }

    const authToken = generateToken(user?._id);
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return Response(res, 200, "Phone OTP verified successfully", {
      token: authToken,
      user,
    });
  } catch (error) {
    console.error("Otp verify error or server error", error);
  }
};

// Profile Update

const profileUpdate = async (req, res, next) => {
  const { username, agreed, about } = req.body;
  const userID = req.user.userID;

  try {
    const user = await User.findById(userID);
    const file = req.file;

    if (file) {
      const uploadresult = await uploadfiletocloudinary(file);
      console.log("upload result: ", uploadresult);
      user.profilePic = uploadresult?.secure_url;
    } else if (req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }
    console.log("this is my user", username);
    if (username) {
      user.username = username;
    }
    if (about) {
      user.about = about;
    }
    if (agreed) {
      user.agreed = agreed;
    }

    await user.save();
    return Response(res, 200, "Profile updated successfully", { user });
  } catch (error) {
    console.error("Error on profile update: ", error);
    return Response(res, 500, "Internal Server Error");
  }
};

// Check Authorization

const checkAuthorization = async (req, res, next) => {
  try {
    const userID = req.user.userID;
    if (!userID) {
      return Response(res, 400, "User not found");
    }
    const user = await User.findById(userID);
    if (!user) {
      return Response(res, 400, "User not found");
    }

    return Response(res, 200, "User is authorized and allow to use Chat App", {
      user,
    });
  } catch (error) {
    console.error("Error on check authorization: ", error);
    return Response(res, 500, "Internal Server Error");
  }
};

//getAllUsers
const getAllUsers = async (req, res, next) => {
  const loggedInUserID = req.user.userID;
  try {
    if (!loggedInUserID) {
      return Response(res, 400, "User not found");
    }
    const users = await User.find({ _id: { $ne: loggedInUserID } })
      .select("username phoneSuffix phoneNumber profilePic about isOnline")
      .lean();

    if (!users) {
      return Response(res, 400, "Users not found");
    }

    const userwithconversation = await Promise.all(
      users.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUserID, user?._id] },
        })
          .populate({
            path: "lastMessage",
            select: "content sender receiver createdAt",
          })
          .lean();

        return { ...user, conversation: conversation || null };
      }),
    );

    return Response(res, 200, "Users found successfully", { userwithconversation });
  } catch (error) {
    console.error("Error on get all users: ", error);
    return Response(res, 500, "Internal Server Error");
  }
};

//Log out
const logout = (req, res, next) => {
  try {
    res.clearCookie("auth_token");
    return Response(res, 200, "Logout successfully");
  } catch (error) {
    console.error("Error on logout: ", error);
    return Response(res, 500, "Internal Server Error On LogOut");
  }
};

module.exports = {
  sendOtp,
  verifyotp,
  profileUpdate,
  logout,
  checkAuthorization,
  getAllUsers
};
