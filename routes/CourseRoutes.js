import express from 'express'
import { addLecturesController, createCourseController, deleteCourseController, deleteLecturesController, getAllCoursesController, getCourseLecturesController } from '../controllers/courseController.js';
import { authorizeAdmin, authorizeSubscriber, isAuthenticated } from '../middleware/auth.js';
import singleUpload from '../middleware/multer.js';
 
const router = express.Router();

// get all courses without lectures
router.route('/courses').get(getAllCoursesController)

// create course - only admin
router.route('/createcourse').post(isAuthenticated , authorizeAdmin ,singleUpload,createCourseController)

// add lecture , delete course , get course details
router.route('/course/:id').get(isAuthenticated , authorizeSubscriber ,getCourseLecturesController).post(isAuthenticated , authorizeAdmin , singleUpload, addLecturesController).delete(isAuthenticated,authorizeAdmin,deleteCourseController)

// delete lecture 

router.route('/lecture').delete(isAuthenticated , authorizeAdmin ,deleteLecturesController)

export default router;