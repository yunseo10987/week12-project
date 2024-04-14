const { validationResult } = require("express-validator");
const { BadRequestException } = require("../utils/Exception");

module.exports = (req, res, next) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    return next(new BadRequestException(results.errors[0].msg));
  }
  return next();
};
