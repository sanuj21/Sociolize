// NPM MODULES
const express = require('express');

// DEVELOPER MODULES
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const commentRouter = require('./commentRoute');
const likeRouter = require('./likeRoute');

const router = express.Router({ mergeParams: true });

router.use('/:postId/comments', commentRouter);
router.use('/:postId/likes', likeRouter);

router.use(authController.protectGoogle);

router
  .route('/')
  .get(postController.getPosts)
  .post(postController.uploadPostPhoto, postController.createPost);
router.get('/me', postController.getPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .delete(postController.deletePost);
module.exports = router;
