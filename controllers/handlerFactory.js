const AppError = require('../util/appError');
const CatchAsync = require('../util/catchAsync');

exports.getDocs = Model => {
  return CatchAsync(async (req, res, next) => {
    const docs = await Model.find({ post: req.params.postId });
    res.status(200).json({
      status: 'success',
      docs
    });
  });
};

exports.getDoc = Model => {
  return CatchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('No doc exists with that Id'));
    }

    res.status(200).json({
      status: 'success',
      doc
    });
  });
};

exports.createDoc = Model => {
  return CatchAsync(async (req, res, next) => {
    let doc = await Model.create(req.body);
    // TRICK, FOR PUPULATING USER
    doc = await Model.findById(doc.id);
    res.status(200).json({
      status: 'success',
      doc
    });
  });
};

exports.updateDoc = Model => {
  return CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      doc
    });
  });
};

exports.deleteDoc = Model => {
  return CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      doc
    });
  });
};
