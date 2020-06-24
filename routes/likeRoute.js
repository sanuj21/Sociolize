// NPM MODULES
const express = require('express');

// DEVELOPER MODULES
const authController = require('../controllers/authController');
const likeController = require('../controllers/likeController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectGoogle);

router
  .route('/')
  .get(likeController.getLikes)
  .post(likeController.setBasicInfo, likeController.createLike);

router
  .route('/:id')
  .get(likeController.getLike)
  .delete(likeController.deleteLike)
  .patch(likeController.updateLike);

module.exports = router;
