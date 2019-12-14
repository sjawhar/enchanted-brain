exports.getError = (message, statusCode = 422) => {
  const error = new Error(
    message instanceof Array ? `Unexpected ${message[0]}: ${message[1]}. ${message[2]}` : message,
  );
  if (statusCode) {
    Object.assign(error, { statusCode });
  }
  return error;
};

exports.getErrorResponse = (error, statusCode = 500) => ({
  statusCode: error.statusCode || statusCode,
  body: JSON.stringify({
    errorMessage: error.message,
    errorType: error.name,
    errorStack: error.stack,
  }),
});
