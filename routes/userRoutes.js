// NPM MODULES
const express = require('express');

// DEVELOPER MODULES
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postRouter = require('./postRoutes');

const router = express.Router();

// CREATING NESTED ROUTES
router.use('/:userId/posts', postRouter);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
// ROUTE WHEN LOGGED IN GOOGLE
router.post(
  '/loginWithG',
  userController.verifyGoogleAc,
  authController.googleSignIn
);
router.post('/forgetPassword', authController.forgetPassword);
router.get('/:username', authController.checkUserExist);
router.get(
  '/search/:searchQuery',
  authController.protectGoogle,
  userController.getAll
);
router.post('/resetPassword/:token', authController.resetPassword);
router.post('/confirmEmail/:token', authController.confirmEmail);
router.post(
  '/changePassword',
  authController.protectGoogle,
  authController.changePassword
);

router.use(authController.protectGoogle);
router.patch('/updateMe', userController.updateMe);
router.patch(
  '/uploadPhoto',
  userController.uploadUserPhoto,
  userController.resizeImage,
  userController.updateMe
);
router.get('/me', userController.getMe);

module.exports = router;
