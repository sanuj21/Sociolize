const mongoose = require('mongoose');
const User = require('./userModel');

const postSchema = mongoose.Schema(
  {
    photo: {
      type: String
    },

    description: {
      type: String
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },

    noOfComments: {
      type: Number,
      default: 0
    },
    noOfLikes: {
      type: Number,
      default: 0
    },

    postedOn: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// VIRUALLY POPULATING LIKES AND COMMENTS
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post'
});

// CHECK WHETHER THE POST HAS ATLEAST ONE PHOTO, DESC, IF NOT THROW AN ERROR
// postSchema.pre('validate', function (next) {
//   if (!(this.photo || this.description)) {
//     return next(new AppError("A post can't be empty"));
//   }
//   return next();
// });
postSchema.statics.calcLikesAndComments = async function (userId) {
  userId = mongoose.Types.ObjectId(userId);

  const stats = await this.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$user',
        nLikes: { $sum: '$noOfLikes' },
        nComments: { $sum: '$noOfComments' }
      }
    }
  ]);

  if (stats.length) {
    await User.findByIdAndUpdate(userId, {
      totalLikes: stats[0].nLikes,
      totalComments: stats[0].nComments
    });
  }
};

postSchema.statics.calcNoOfPosts = async function (userId) {
  userId = mongoose.Types.ObjectId(userId);
  const stats = await this.aggregate([
    {
      $match: { user: userId }
    }
  ]);

  if (stats) {
    await User.findByIdAndUpdate(userId, {
      noOfPosts: stats.length
    });
  }
};

// ON SAVE AND ON UPDATE -->  UPDATE THE noOfPosts FIELD
postSchema.pre('save', function (next) {
  this.constructor.calcNoOfPosts(this.user);
  this.constructor.calcLikesAndComments(this.use);
  // this.constructor -> Constructor of this obj
  return next();
});

// POPULATE THE DOC WITH COMMENTS AND LIKES
postSchema.pre(/^find/, function (next) {
  this.populate('comments').populate('likes').populate('user');
  return next();
});

// NOTE:
/*
At the pre find hook , there won't be any changes to the doc, as this midddle ware
runs before it finds and modifies that doc.
So we need to call the calcPosts method at post hook, however the problem with that,
is when the post hook will be deleted so, we will not be able to get a instance of the
doc. 
Solution: Solution to that is , save the doc, which is going to be deleted at pre hook, in
this obj. So we can fetch that in post hook and call the method with its help.
// */
// postSchema.pre(/^findOneAnd/, async function (next) {
//   this.postToModify = await this.findOne();
//   return next();
// });

postSchema.post(/^findOneAnd/, async function (doc, next) {
  if (!doc) return next();
  doc.constructor.calcNoOfPosts(doc.user.id);
  doc.constructor.calcLikesAndComments(doc.user.id);
  return next();
});

// CREATING MODEL
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
