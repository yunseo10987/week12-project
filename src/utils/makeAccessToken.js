const jwt = require("jsonwebtoken");

const makeAccessToken = (Object) => {
  const accessToken = jwt.sign(Object, process.env.TOKEN_SECRET_KEY, {
    issuer: "stageus",
    expiresIn: "1h",
  });
  return accessToken;
};

module.exports = makeAccessToken;
