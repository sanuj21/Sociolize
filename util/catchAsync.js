module.exports = fn => {
  return async (req, res, next) => {
    // THE CATCH METHOD WILL BE ONLY CALLED ONLY IF THE PROMISE IS REJECTED
    // .catch INTERNALLY THE PROMISE.prototype.than(onRejected- callback ) method
    await fn(req, res, next).catch(next);
    // THIS IS SAME AS --> For Refer
    // fn(req, res, next).catch((err) => {
    //   next(err);
    // });
  };
};
