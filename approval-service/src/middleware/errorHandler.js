const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  let statusCode = 500;

  if (err.message.includes('not found')) statusCode = 404;
  else if (err.message.includes('Insufficient')) statusCode = 400;
  else if (err.message.includes('already')) statusCode = 400;
  else if (err.message.includes('Only pending')) statusCode = 400;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;