const multer = require('multer');
const fs = require('fs');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const handlerFactory = require('./handlerFactory');
const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');

const genericPost = fn => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('User is not logged in!! Please loggin to get access')
      );
    }
    req.body.user = req.user.id;
    await fn(req, res, next);
  };
};

const restrictPostsAccess = async (req, next) => {
  if (req.params.userId !== req.user.id) {
    const user = await User.findById(req.params.userId);
    // CHECKS IF ACCOUNT IS PUBLIC, IF IT IS NOT,
    // THAN CHECKS IF USER IF FOLLOWING THE DEMANDING POSTS USER
    if (user.accountType !== 'public') {
      if (!req.user.following.includes(req.params.userId.toString())) {
        return next(new AppError('Please follow to see accounts posts', 403));
      }
    }
  }
};

exports.getPosts = genericPost(
  catchAsync(async (req, res, next) => {
    let posts;
    // IF URL INCLUDES FOLLOWING, THAN GET THE FOLLOWING ACCOUNTS POSTS
    if (req.url.includes('/me')) {
      restrictPostsAccess(req, next);
      posts = await Post.find({ user: req.params.userId });
    } else {
      const userIdsArr = [...req.user.following];
      userIdsArr.push(req.user.id);
      posts = await Post.find({
        user: {
          $in: userIdsArr
        }
      });
    }

    if (posts.length < 1) {
      return next(new AppError('No Posts found!!', 404));
    }

    res.status(200).json({
      status: 'success',
      posts
    });
  })
);

exports.getPost = genericPost(
  catchAsync(async (req, res, next) => {
    restrictPostsAccess(req, next);
    await handlerFactory.getDoc(Post)(req, res, next);
  })
);

exports.createPost = genericPost(
  catchAsync(async (req, res, next) => {
    if (req.params.userId !== req.user.id) {
      return next(new AppError("You can't create post of other user", 403));
    }
    if (req.file) req.body.photo = req.file.filename; // IF USER IS UPLOADING A PIC
    await handlerFactory.createDoc(Post)(req, res, next);
  })
);

exports.deletePost = genericPost(
  catchAsync(async (req, res, next) => {
    if (req.params.userId !== req.user.id) {
      return next(new AppError("You can't delete post of other user", 403));
    }

    // DELETING PHOTO FROM DB
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('No post exist with that Id', 404));
    if (post.photo) {
      fs.unlink(`public/images/posts/${post.photo}`, function (err) {});
    }

    await handlerFactory.deleteDoc(Post)(req, res, next);

    // DELETE THE LIKES AND COMMENTS OF THE POST

    await Like.deleteMany({ post: req.params.id });
    await Comment.deleteMany({ post: req.params.id });
  })
);

// DON"T NEED
// exports.updatePost = genericPost(catchAsync(async (req, res, next) => {}));
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/posts/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `post-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('You can only upload images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPostPhoto = upload.single('photo');
