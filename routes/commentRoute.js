// NPM MODULES
const express = require('express');

// DEVELOPER MODULES
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectGoogle);

router
  .route('/')
  .get(commentController.getComments)
  .post(commentController.setBasicInfo, commentController.createComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .delete(commentController.deleteComment)
  .patch(commentController.updateComment);

module.exports = router;
