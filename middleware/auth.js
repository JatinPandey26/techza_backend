import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Not logged in", 401));

  const decode = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decode._id);

  next();
});

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not authorized to access this content`,
        403
      )
    );

  next(); // to next middleware
};

export const authorizeSubscriber = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is neither a subsriber nor a admin. No access granted.`,
        403
      )
    );

  next(); // to next middleware
};
