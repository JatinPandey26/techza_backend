import express from "express";
import {
  addToPlaylistController,
  changePasswordController,
  deleteUserController,
  deletMyProfileController,
  forgetPasswordController,
  getAllUsersController,
  getMyProfileController,
  loginContoller,
  logoutController,
  registerContoller,
  removeFromPlaylistController,
  resetPasswordController,
  updateProfileController,
  updateProfilePictureController,
  updateUserRoleController,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";

const router = express.Router();

//register new user

router.route("/register").post( singleUpload,registerContoller);

// login user

router.route("/login").post(loginContoller);

// logout

router.route("/logout").post(logoutController);

// get my profile

router.route("/me").get(isAuthenticated, getMyProfileController);

// change password

router.route("/changepassword").put(isAuthenticated, changePasswordController);

// update profile

router.route("/updateprofile").put(isAuthenticated, updateProfileController);

// update profile picture
router
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePictureController);

// forget password - get reset token

router
  .route("/forgetpassword")
  .post(forgetPasswordController);

// reset password - use reset token

router
  .route("/resetpassword/:token")
  .put(resetPasswordController);


// add to playlist


router
  .route("/addtoplaylist")
  .post(isAuthenticated,addToPlaylistController);

// remove from playlist 


router
  .route("/removefromplaylist")
  .delete(isAuthenticated,removeFromPlaylistController);

// get all users - admin
router.route('/admin/users').get(isAuthenticated,authorizeAdmin,getAllUsersController)  


// change role - admin 

router.route('/admin/user/:id').put(isAuthenticated,authorizeAdmin,updateUserRoleController).delete(isAuthenticated,authorizeAdmin,deleteUserController)

// delete my profile
router.route('/me').delete(isAuthenticated,authorizeAdmin,deletMyProfileController)

export default router;
