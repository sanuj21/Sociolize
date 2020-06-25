const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const Email = require('../util/email');

// CREATE AND SEND VERIFICATION TOKEN
const createSendToken = async (user, req, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_VALIDITY
  });

  if (!user.emailConfirmed) {
    // SEND THE EMAIL FOR ACCOUNT CONFIRMATION
    const confirmationToken = await user.createToken(function (hashtoken) {
      this.emailConfirmToken = hashtoken;
    });
    const confirmationUrl = `${req.protocol}://${req.hostname}/confirmEmail/${confirmationToken}`;
    await new Email(user, confirmationUrl).sendWelcome();

    // NOT ALLOWING USER TO ACCESS HIS/HER ACC, IF EMAIL NOT VERIFIED
    // return res.status(200).json({
    //   status: 'success',
    //   message:
    //     'A email confirmation has sent to your email. Please Confirm to proceed furthure!!!'
    // });
  }

  // SAVE THE TOKEN AS COOKIE
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRES_IN
    ),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    token
  });
};

// VALIDATING LOGIN TOKEN
const validateLoginToken = req => {
  let token;
  // IF TOKEN EXIST
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // ARRAY DESTRUCTURING
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  return token;
};

// FUNCTION TO VALIDATE USER
exports.protectGoogle = catchAsync(async (req, res, next) => {
  const token = validateLoginToken(req);
  if (!token) {
    return next(
      new AppError('User is not logged in!! Please login to access this!!', 401)
    );
  }

  // VALIDATE TOKEN
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXIST WITH THE ID RETURNED BY THE VERIFY FUNC
  const currentUser = await User.findOne({ _id: decoded.id });
  if (!currentUser) {
    return next(
      new AppError('User is not logged in!! Please login to access this!!', 401)
    );
  }

  // CHECK WHERE USER HAS CHANGED HIS PASSWORD, IF NOT GRANT ACCESS
  // NOT IN CASE OF GOOGLE SIGNIN
  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(new AppError('Password Changed!! Please Login again!!', 401));
  // }

  req.user = currentUser;
  res.locals.user = currentUser;
  return next();
});

// CHECKING IF A USER IS LOGGED IN
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = validateLoginToken(req);
  if (!token) return next();
  // VALIDATE TOKEN
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // CHECK IF USER STILL EXIST WITH THE ID RETURNED BY THE VERIFY FUNC
  const currentUser = await User.findOne({ _id: decoded.id });
  if (!currentUser) return next();
  // NOT IN CASE OF GOOGLE SIGNIN
  // if (currentUser.changePasswordAfter(decoded.iat)) return next();
  req.user = currentUser;
  res.locals.user = currentUser;
  return next();
});

exports.login = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const { email, password } = { ...req.body };
  const user = await User.findOne({ email: email }).select('+password');
  // WHEN WE CALL NEXT(), THAN IT MATCHES THE NEXT ROUTE
  // BUT WHENEVER WE CALL IT WITH ONE ARGUMENT, THAN IT MATCHES THE THE ROUTES WHICH ARE TAKING 4 ARGS
  if (!user) {
    return next(
      new AppError("Your Email Address doesn't belong to a account", 404)
    );
  }

  // CREATING A ERROR OBJECT, AND PASSING IT AS FOURTH ARG, ACTUALLY ITS FIRST, FOLLOWED BY REQ, RES, NEXT

  if (!(await User.checkPassword(password, user.password))) {
    return next(
      new AppError('Wrong Email or Password!! Please Check again!!', 401)
    );
  }

  createSendToken(user, req, res);
});

// GOOGLE SIGN IN
exports.googleSignIn = catchAsync(async (req, res, next) => {
  if (!req.body.email) return next();

  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    if (!req.body.username) {
      return res.status(200).json({
        status: 'notFound',
        message: 'User not exist!!'
      });
    }
    user = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email
    });

    const dev = await User.findOne({ username: 'anuj' });
    user.following.push(dev.id);
    dev.followers.push(user.id);
    await user.save({ validateBeforeSave: false });
    await dev.save({ validateBeforeSave: false });
  }

  createSendToken(user, req, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo
  });

  createSendToken(user, req, res);
});

// CHANGE PASSWORD
exports.changePassword = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('Your Session has expired!! Please login again!!', 401)
    );
  }

  const user = await User.findById(req.user.id);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  res.status(200).json({
    status: 'success'
  });
});

// FORGET PASSWORD
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // CHECK IF USER EXISTS BASED ON EMAIL GIVEN
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user Found with that email!!', 404));
  }

  // CREATE A TOKEN
  const token = await user.createToken(function (hashedToken) {
    // CAN'T USER ARROW FUNC HERE, BECAUSE OF THIS
    this.passwordResetToken = hashedToken;
    this.passwordResetExpires = Date.now() + 1000 * 60 * 15; // IN 15 MIN
  });

  // SEND THE MAIL
  const resetUrl = `${req.protocol}://${req.hostname}/resetPassword/${token}`;
  await new Email(user, resetUrl).sendResetToken();

  res.status(200).json({
    status: 'success',
    message:
      'An Email has sent to your registered email address, instruction regarding reseting your password'
  });
});

const validateToken = async (req, next, fn) => {
  // HASH THE TOKEN
  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // GET USER BASED ON HASHTOKEN
  let user;
  if (req.url.includes('resetToken')) {
    user = await User.findOne({ passwordResetToken: hashedToken });
  } else if (req.url.includes('confirmEmail')) {
    user = await User.findOne({ emailConfirmToken: hashedToken });
  }

  if (!user) {
    return next(
      new AppError('Your token is invalid!! Please get a new one', 404)
    );
  }

  fn(user);
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  await validateToken(req, next, async user => {
    // CHECK IF THE TOKEN HAS EXPIRED OR NOT
    if (user.passwordResetExpires.getTime() < Date.now()) {
      return next(
        new AppError('Ohh!! Your token has expired!! Please get a new one', 404)
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your Password Reseted Successfully'
    });
  });
});

// CONFIRM EMAIL
exports.confirmEmail = catchAsync(async (req, res, next) => {
  validateToken(req, next, async user => {
    user.emailConfirmed = true;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Your Email Confirmed Successfully'
    });
  });
});

// CHECK IF USER EXIST
exports.checkUserExist = catchAsync(async (req, res, next) => {
  if (req.params.username) {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(200).json({
        status: 'failed',
        message: 'User does not exist'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User exist'
    });
  }
});

// LOGGING OUT
exports.logout = (req, res, next) => {
  res.cookie('jwt', undefined, {
    expires: new Date(Date.now() + 500)
  });
  res.status(200).json({
    status: 'success'
  });
};
