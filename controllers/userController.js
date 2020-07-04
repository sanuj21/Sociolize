const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const User = require('../models/userModel');
const Email = require('../util/email');

exports.updateMe = catchAsync(async (req, res, next) => {
  // IF USER DOESN'T EXIST, RETURN IT
  if (!req.user) {
    return next(
      new AppError(
        'User is not Logged in!! Please login to perform this operation!!',
        401
      )
    );
  }

  if (req.file) {
    req.body.photo = req.file.filename;
    const user = await User.findById(req.user.id);
    if (user.photo) {
      fs.unlink(`public/images/users/${user.photo}`, function (err) {});
    }
  }

  // RETURN IF USER TRIES TO UPDATE PASSWORD
  if (req.body.password) {
    return next(
      new AppError(
        "You can't change password on this route!! Please use the updatePassword route",
        400
      )
    );
  }

  let updatedUser;
  let followedUser;
  // IF EXIST, MEANS USER IS CLICK ON FOLLOW BTN
  if (req.body.followed) {
    // UPDATE THE FOLLOWING OF LOGGED IN USER
    updatedUser = await User.findById(req.user.id);
    updatedUser.following.push(req.body.followed);
    await updatedUser.save({ validateBeforeSave: false });

    //  UPDATE THE FOLLOWERS OF LOGGED IN USER
    followedUser = await User.findById(req.body.followed);
    followedUser.followers.push(req.user.id);
    await followedUser.save({ validateBeforeSave: false });
  } else if (req.body.unfollowed) {
    let index;
    // UPDATE THE FOLLOWING OF LOGGED IN USER
    updatedUser = await User.findById(req.user.id);
    index = updatedUser.following.indexOf(req.body.unfollowed);
    updatedUser.following.splice(index, 1);
    await updatedUser.save({ validateBeforeSave: false });

    //  UPDATE THE FOLLOWERS OF LOGGED IN USER
    followedUser = await User.findById(req.body.unfollowed);
    index = followedUser.following.indexOf(req.user.id);
    followedUser.followers.splice(index, 1);
    await followedUser.save({ validateBeforeSave: false });
  } else {
    updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true, // BY DEFUALT THIS METHOD RETURNS THE OLD DOC
      runValidators: true
    });
  }

  // IF USER TRIES TO UPDATE THE EMAIL, SEND HIM CONFIRMATION AND REVERT EMAILCONFIRMED TO FALSE
  if (req.body.email) {
    const confirmationToken = await updatedUser.createToken(function (
      hashtoken
    ) {
      this.emailConfirmToken = hashtoken;
    });
    const confirmationUrl = `${req.protocol}://${req.hostname}/confirmEmail/${confirmationToken}`;
    await new Email(updatedUser, confirmationUrl).sendEmailUpdateConfirm();
  }

  res.status(200).json({
    status: 'success',
    updatedUser
  });
});

// GET LOGGED USER DATA
exports.getMe = catchAsync(async (req, res, next) => {
  if (!req.user) return next('Please login to get access', 401);

  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    user
  });
});

// GET ALL [ FOR SEARCH ]

exports.getAll = catchAsync(async (req, res, next) => {
  if (req.params.searchQuery) {
    const exp = new RegExp(`^${req.params.searchQuery}`, 'i');
    let users = await User.find({ username: exp });
    const usersAnother = await User.find({ name: exp });

    if (users.length < usersAnother.length) {
      users = usersAnother;
    }

    const loggedInUser = await User.findById(req.user.id);
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === loggedInUser.id) {
        users.splice(i, 1);
        break;
      }
    }

    res.status(200).json({
      status: 'success',
      loggedInUser,
      users
    });
  }
});

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images/users/');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

// UPLOADING PROFILE PIC
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

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return;

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  return next();
});

exports.uploadUserPhoto = upload.single('photo');

exports.verifyGoogleAc = catchAsync(async (req, res, next) => {
  const token = req.body.gToken;
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];

  if (!payload)
    return new AppError('Login Failed!!, Try Again after some time', 400);

  req.body.name = payload.name;
  req.body.email = payload.email;
  next();
});
