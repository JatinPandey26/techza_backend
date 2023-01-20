import express from 'express'
import { buySubscriptionController, cancelSubscriptionController, getRazorPayKeyController, paymentVerificationController } from '../controllers/paymentController.js';

import { authorizeAdmin, authorizeSubscriber, isAuthenticated } from '../middleware/auth.js';
 
const router = express.Router();

// buy subscription

router.route("/subscribe").get(isAuthenticated,buySubscriptionController);

// payment verification and save reference in database

router.route("/paymentverification").post(isAuthenticated,paymentVerificationController);

// get RAZORPAY_API_KEY 

router.route("/razorpaykey").get(isAuthenticated,getRazorPayKeyController);

// cancel  subscription

router.route("/subscribe/cancel").delete(isAuthenticated,authorizeSubscriber,cancelSubscriptionController);


export default router;
