import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
  if (err instanceof createHttpError) {
    res.status(status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};
