const handleFactory = require('./handlerFactory');
const Comment = require('../models/commentModel');

exports.setBasicInfo = (req, res, next) => {
  req.body.commentedBy = req.user.id;
  req.body.post = req.params.postId;
  return next();
};
exports.getComments = handleFactory.getDocs(Comment);
exports.getComment = handleFactory.getDoc(Comment);
exports.createComment = handleFactory.createDoc(Comment);
exports.updateComment = handleFactory.updateDoc(Comment);
exports.deleteComment = handleFactory.deleteDoc(Comment);
