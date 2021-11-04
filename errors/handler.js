const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  
  if (err.name === 'ApplicationError')
    res
      .status(err.code)
      .json(err);

  else next(err);
}

export default errorHandler;