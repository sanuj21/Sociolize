const mongoose = require('mongoose');
const Post = require('./postModel');

const commentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "A comment can't be empty"]
    },

    commentedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },

    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    },
    repliedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment'
    },
    commentedOn: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// POPULATE THE COMMENT WITH THE USER COMMENTED
commentSchema.pre(/^find/, function (next) {
  this.populate({ path: 'commentedBy', select: 'username' }).sort(
    '-commentedOn'
  );
  return next();
});

// CALCULATING NO. OF COMMENTS FOR A POST AND UPDATING
commentSchema.statics.calcNoComments = async function (postId) {
  postId = mongoose.Types.ObjectId(postId);
  const stats = await this.aggregate([
    {
      $match: { post: postId }
    }
  ]);

  if (stats) {
    await Post.findByIdAndUpdate(postId, { noOfComments: stats.length });
  }
};

commentSchema.pre('save', function (next) {
  this.constructor.calcNoComments(this.post);
  return next();
});

commentSchema.post(/^findOneAnd/, function (doc, next) {
  if (!doc) return next();
  doc.constructor.calcNoComments(doc.post);
  return next();
});

// CREATING MODEL
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
