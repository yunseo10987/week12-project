const jwt = require("jsonwebtoken");

const remakeAccessToken = (token) => {
  const result = {
    success: false,
    message: "",
  };
  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET_KEY_REFRESH);
    const accessToken = jwt.sign(
      {
        idx: data.idx,
        nickname: data.nickname,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        issuer: "stageus",
        expiresIn: "1h",
      }
    );
    result.success = true;
    result.data.accessToken = accessToken;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
};

module.exports = remakeAccessToken;
