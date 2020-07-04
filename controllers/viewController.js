const mongoose = require('mongoose');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const User = require('../models/userModel');
const Post = require('../models/postModel');

// CONVERTING A STRING ARR TO MONGOOSE OBJECT ID ARR
const toObjectId = arr => {
  const tempArr = [];

  arr.forEach((el, i) => {
    tempArr[i] = mongoose.Types.ObjectId(el);
  });

  return tempArr;
};

const checkWhetherLoggedIn = (req, res) => {
  if (!req.user) {
    res.render('login', {
      title: 'Sociolize   '
    });
    return false;
  }
  return true;
};

exports.getHomePage = catchAsync(async (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  let followingArr = Array.from(req.user.following);
  followingArr.push(req.user.id);
  followingArr = toObjectId(followingArr);
  const posts = await Post.find({
    user: {
      $in: followingArr
    }
  })
    .populate('user')
    .sort('-postedOn');

  res.render('index', {
    title: 'Sociolize   ',
    posts
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.render('login', {
    title: 'Sociolize   '
  });
});

// GETTING MY PROFILE (LOGGED USER IN PROFILE)
exports.getMyProfile = (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;

  res.render('myProfile', {
    title: 'Sociolize   '
  });
};

// EDITING PAGE (MY PROFILE)
exports.editMyProfile = (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  res.render('editProfile', {
    title: 'Sociolize   '
  });
};

// GETTING USER PROFILE
exports.getUserProfile = catchAsync(async (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  if (!req.params.username) {
    return next(new AppError('Please provide the username', 400));
  }

  const user = await User.findOne({ username: req.params.username });

  res.render('myProfile', {
    title: 'Sociolize   ',
    userPublic: user
  });
});

exports.getNotExist = (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  res.render('notExist', {
    title: 'Sociolize',
    message: 'This Feature is in Development!!! Sorry For the Incovienience!!'
  });
};

// SHOW FOLLOWINGS
exports.getFollowings = catchAsync(async (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  let followingArr = Array.from(req.user.following);
  followingArr = toObjectId(followingArr);

  followingArr = await User.find({
    _id: {
      $in: followingArr
    }
  });

  res.render('accountsList', {
    title: 'Sociolize   ',
    followingArr
  });
});

// SHOW FOLLOWINGS
exports.getFollowers = catchAsync(async (req, res, next) => {
  if (!checkWhetherLoggedIn(req, res)) return;
  let followersArr = Array.from(req.user.followers);
  followersArr = toObjectId(followersArr);

  followersArr = await User.find({
    _id: {
      $in: followersArr
    }
  });

  res.render('accountsList', {
    title: 'Sociolize   ',
    followersArr
  });
});
