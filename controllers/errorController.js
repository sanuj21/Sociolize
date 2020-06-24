const sendError = (err, req, res) => {
  // When data is requested through api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      err: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    if (err.statusCode === 401) {
      return res.status(err.statusCode).render('login', {
        title: 'Login to Continue!!'
      });
    }
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      message: err.message
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendError(err, req, res);
  } else {
    sendError(err, req, res);
  }
};
