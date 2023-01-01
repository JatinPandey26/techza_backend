import express from 'express'
import { contactController, courseRequestController, getAdminDashBoardStatsController } from '../controllers/otherControllers.js';

import { authorizeAdmin, isAuthenticated } from '../middleware/auth.js';
 
const router = express.Router();

// contact form

router.route('/contact').post(contactController);

// course Request form

router.route('/courserequest').post(courseRequestController);

// get admin dashboard stats

router.route('/admin/stats').get(isAuthenticated, authorizeAdmin,getAdminDashBoardStatsController)

export default router;
