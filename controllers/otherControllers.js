import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/Stats.js";

export const contactController = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    next(new ErrorHandler("Please fill all the fields", 400));

  const to = process.env.MY_MAIL;
  const subject = "Contact from Techza";
  const text = `I am ${name} and my email is ${email}.\n ${message}`;
  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your message has been sent",
  });
});

export const courseRequestController = catchAsyncError(
  async (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
      next(new ErrorHandler("Please fill all the fields", 400));

    const to = process.env.MY_MAIL;
    const subject = "Request for a course on Techza";
    const text = `I am ${name} and my email is ${email}.\n ${message}`;
    await sendEmail(to, subject, text);

    res.status(200).json({
      success: true,
      message: "Your request has been sent",
    });
  }
);

export const getAdminDashBoardStatsController = catchAsyncError(
  async (req, res, next) => {
    const stats = await Stats.find({})
      .sort({ createdAt: "descending" })
      .limit(12);

    const statsData = [];

    const requiredSize = 12 - stats.length;

    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }

    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({ users: 0, subscriptions: 0, views: 0 });
    }

    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscriptions;
    const viewsCount = statsData[11].views;

    let usersProfit = true,
      viewsProfit = true,
      subscriptionsProfit = true;
    let usersPercentage = 0,
      viewsPercentage = 0,
      subscriptionsPercentage = 0;

    // users
    const userPreviousMonth = statsData[10].users;
    const userGain = usersCount - userPreviousMonth;
    usersPercentage =
      (userGain / (userPreviousMonth !== 0 ? userPreviousMonth : 1)) * 100;

    if (userGain < 0) {
      usersProfit = false;
    }

    // subscriptions

    const subscriptionsPreviousMonth = statsData[10].subscriptions;
    const subscriptionsGain = subscriptionCount - subscriptionsPreviousMonth;
    subscriptionsPercentage =
      (subscriptionsGain /
        (subscriptionsPreviousMonth !== 0 ? subscriptionsPreviousMonth : 1)) *
      100;

    if (subscriptionsGain < 0) {
      subscriptionsProfit = false;
    }

    // views
    const viewsPreviousMonth = statsData[10].views;
    const viewsGain = viewsCount - viewsPreviousMonth;
    viewsPercentage =
      (viewsGain / (viewsPreviousMonth !== 0 ? viewsPreviousMonth : 1)) * 100;

    if (viewsGain < 0) {
      viewsProfit = false;
    }

    res.status(200).json({
      success: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      usersPercentage,
      subscriptionsPercentage,
      viewsPercentage,
      usersProfit,
      subscriptionsProfit,
      viewsProfit,
    });
  }
);
