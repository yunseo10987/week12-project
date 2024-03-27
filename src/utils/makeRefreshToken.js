const jwt = require("jsonwebtoken");

const makeRefreshToken = (Object) => {
  const refreshToken = jwt.sign(Object, process.env.TOKEN_SECRET_KEY_REFRESH, {
    issuer: "stageus",
    expiresIn: "24h",
  });
  return refreshToken;
};

module.exports = makeRefreshToken;
