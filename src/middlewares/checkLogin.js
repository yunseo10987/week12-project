const jwt = require("jsonwebtoken");
const {
  UnauthorizedException,
  BadRequestException,
} = require("../utils/Exception");

const checkLogin = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(new UnauthorizedException("토큰이 없습니다."));
  }

  try {
    const loginUser = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.decoded = loginUser;
    next();
  } catch (err) {
    next(new UnauthorizedException("정상적이지 않은 접근입니다"));
  }
};
module.exports = checkLogin;
