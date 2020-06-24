const handleFactory = require('./handlerFactory');
const Like = require('../models/likeModel');
const AppError = require('../util/appError');
const CatchAsync = require('../util/catchAsync');

exports.setBasicInfo = (req, res, next) => {
  req.body.likedBy = req.user.id;
  req.body.post = req.params.postId;
  return next();
};
exports.getLikes = handleFactory.getDocs(Like);
exports.getLike = handleFactory.getDoc(Like);
exports.createLike = handleFactory.createDoc(Like);
exports.updateLike = handleFactory.updateDoc(Like);
exports.deleteLike = handleFactory.deleteDoc(Like);
