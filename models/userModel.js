const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user should have a name']
    },

    bio: {
      type: String
    },

    username: {
      type: String,
      required: [true, 'A user must have a username'],
      unique: [true, 'A username must be unique']
    },

    email: {
      type: String,
      required: [true, 'A user should have a email'],
      unique: [true, 'This email belongs to a account!! Please Login'],
      validate: [validator.isEmail, 'Please enter a valid email']
    },

    photo: {
      type: String
    },
    password: {
      type: String
    },

    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: 'Passwords do not match'
      }
    },

    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],

    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],

    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },

    accountType: {
      type: String,
      enum: ['private', 'public'],
      default: 'public'
    },
    active: {
      type: Boolean,
      enum: [true, false],
      default: true
    },

    emailConfirmed: {
      type: Boolean,
      default: false
    },

    noOfPosts: {
      type: Number,
      default: 0
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    emailConfirmToken: String,
    passwordResetExpires: Date
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// VIRTUALLY POPULATING THE POSTS
userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'user',
  localField: '_id'
});

// POPULATE THE POSTS ON FINDONE
userSchema.pre('findOne', function (next) {
  this.populate('posts');
  return next();
});

// ENCRYPTING THE PASSWORD BEFORE SAVING AND SETTING THE passwordConfirm TO undefined
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // INITIALIZE THE passwordChangedAt
  this.passwordChangedAt = Date.now() - 1000;
  const hashedPassword = await bcryptjs.hash(this.password, 10);
  this.password = hashedPassword;
  this.passwordConfirm = undefined;
  return next();
});

// COMPARING THE ENTERED AND DATABASE PASSWORD
userSchema.statics.checkPassword = async function (inputPass, dbPass) {
  return await bcryptjs.compare(inputPass, dbPass);
};

// NEED TO USE THIS VARIABLE, SO IT SHOULD BE A INSTANCE METHOD
userSchema.methods.changePasswordAfter = function (JWTTime) {
  const changedPasswordTime = this.passwordChangedAt.getTime() / 1000;
  // AS JWTTimeStamp IS IN SECONDS, SO WE NEED TO DIVIDE OUR SAVED TIME BY 1000 FOR COMPARISON
  return JWTTime < changedPasswordTime;
};

// CREATING TOKEN TO SEND TO USER
userSchema.methods.createToken = async function (setToken) {
  const token = crypto.randomBytes(32).toString('hex');
  // CREATING HASH OBJ, WITH TOKEN, AND DIGESTING (CONVERTING) IT TO STRING
  // DIGEST TAKES HEX AS PARA, SO IT REDUCES US TO CONVERT INTO STRING USING HEX PARA
  const hashToken = await crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // CALLING THE FUNC WITH, PASSING THIS VAR
  setToken.call(this, hashToken); // SAVES TOKEN TO DB
  await this.save({ validateBeforeSave: false });

  return token;
};

// CREATING MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
