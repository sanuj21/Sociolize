const express = require('express');

// DEVELOPER MODULE
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getHomePage);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/notExist', authController.isLoggedIn, viewController.getNotExist);
router.get(
  '/following',
  authController.isLoggedIn,
  viewController.getFollowings
);
router.get(
  '/followers',
  authController.isLoggedIn,
  viewController.getFollowers
);
router.get(
  '/myProfile',
  authController.isLoggedIn,
  viewController.getMyProfile
);
router.get(
  '/editProfile',
  authController.isLoggedIn,
  viewController.editMyProfile
);

// GETTING USER (PUBLIC PROFILE)
router.get(
  '/user/:username',
  authController.isLoggedIn,
  viewController.getUserProfile
);

module.exports = router;
