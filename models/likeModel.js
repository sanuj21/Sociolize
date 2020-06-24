const mongoose = require('mongoose');
const Post = require('./postModel');

const likeSchema = mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    },
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment'
    },

    likedOn: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// CREATING INDEX
// A USER CAN LIKE ONLY ONCE
likeSchema.index({ post: 1, likedBy: 1, comment: 1 }, { unique: true });

// POPULATE THE COMMENT WITH THE USER COMMENTED
likeSchema.pre(/^find/, function (next) {
  this.populate({ path: 'likedBy', select: 'username photo' });
  return next();
});

// CALCULATING NO. OF LIKES FOR A POST AND UPDATING
likeSchema.statics.calcNoLikes = async function (postId) {
  postId = mongoose.Types.ObjectId(postId);
  const stats = await this.aggregate([
    {
      $match: { post: postId }
    }
  ]);

  if (stats) {
    await Post.findByIdAndUpdate(postId, { noOfLikes: stats.length });
  }
};

likeSchema.pre('save', function (next) {
  this.constructor.calcNoLikes(this.post);
  return next();
});

likeSchema.post(/^findOneAnd/, function (doc, next) {
  if (!doc) return next();
  doc.constructor.calcNoLikes(doc.post);
  return next();
});

// CREATING MODEL
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
