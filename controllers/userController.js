import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";

export const registerContoller = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const file = req.file;

  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter all fields", 400));

  let user = await User.findOne({ email });

  if (user)
    return next(new ErrorHandler("User with same email already exists", 409)); // 409 conflict in request

  // upload to cloudinary

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

export const loginContoller = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findOne({ email }).select("+password"); // as by default we restricted to get password in model but for login purpose we accessing that

  if (!user) return next(new ErrorHandler("Incorrect email or password", 401)); // 401 not found

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password", 401)); // 401 not found

  sendToken(res, user, "Login Successfully , welcome back " + user.name, 201);
});

export const logoutController = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "logout Successfully",
    });
});

export const getMyProfileController = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  }
);

export const changePasswordController = catchAsyncError(
  async (req, res, next) => {
    const { oldpassword, newpassword } = req.body;

    if (!oldpassword || !newpassword)
      return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldpassword);

    if (!isMatch)
      return next(new ErrorHandler("old password is Incorrect", 401)); // 401 not macth

    user.password = newpassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "password changed Successfully",
    });
  }
);

export const updateProfileController = catchAsyncError(
  async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "profile updated Successfully",
    });
  }
);

export const updateProfilePictureController = catchAsyncError(
  async (req, res, next) => {
    const file = req.file;

    if (!file) return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user.avatar = { public_id: myCloud.public_id, url: myCloud.secure_url };

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile picture updated Successfully",
    });
  }
);

export const forgetPasswordController = catchAsyncError(
  async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    // send token via email

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `Click on the link to reset password ${url} . If you have not requested then please ignore.`;
    await sendEmail(user.email, "Techza Reset Password", message);

    res.status(200).json({
      success: true,
      message: `Reset token has been send to ${user.email} Successfully`,
    });
  }
);

export const resetPasswordController = catchAsyncError(
  async (req, res, next) => {
    const { token } = req.params;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      ResetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return next(new ErrorHandler("Invalid or Expired token", 401));

    user.password = req.body.password;

    user.ResetPasswordExpire = undefined;
    user.ResetPasswordToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Reset password Successfully",
    });
  }
);

export const addToPlaylistController = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body._id);

    if (!course) return next(new ErrorHandler("Invalid course id", 404));

    const itemExists = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
    });

    if (itemExists)
      return next(new ErrorHandler("Course already present in playlist", 409));

    user.playlist.push({
      course: course._id,
      poster: course.poster.url,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to playlist Successfully",
    });
  }
);

export const removeFromPlaylistController = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.query._id); // its not good to send data in delete request so instead of body we are using query

    if (!course) return next(new ErrorHandler("Invalid course id", 404));

    const newPlaylist = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
    });

    user.playlist = newPlaylist;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from playlist Successfully",
    });
  }
);

// admin controllers

export const getAllUsersController = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//update user role - admin

export const updateUserRoleController = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("user not found", 404));

    user.role = user.role === "user" ? "admin" : "user";

    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name} is now a ${user.role}`,
    });
  }
);

// delete user - admin

export const deleteUserController = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("user not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  // cancel subscription

  await user.delete();

  res.status(200).json({
    success: true,
    message: `${user.name} is deleted`,
  });
});

// delete my profile

export const deletMyProfileController = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // cancel subscription

    await user.delete();

    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()) })
      .json({
        success: true,
        message: `${user.name} is deleted`,
      });
  }
);

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "descending" }).limit(1);
  if (stats.length === 0) return;
  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].subscriptions = subscription.length;
  stats[0].users = await User.countDocuments();
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
