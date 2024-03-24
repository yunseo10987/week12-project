const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const { token } = req.headers;
  const result = {
    success: false,
    message: "",
  };

  try {
    //토큰 검증 1. 토큰이 조작되지 않았는지 2. 권한 체크

    //로그인이 되었는지
    // if (token === null || token === undefined || token === "") {
    //   throw new Error("로그인이 필요합니다.");
    // }
    // 토큰이 조작되지 않았는지, 로그인이 되었는지
    jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    next();
  } catch (e) {
    //토큰 에러 메시지 종류 1. jwt must be provided 2 jwe expired 3.invalid token
    if (e.message === "jwt must be provided")
      result.message = "로그인이 필요합니다.";
    else if (e.message === "jwt expired")
      result.message = "세션이 만료되었습니다. 다시 로그인해주세요";
    else if (e.message === "invalid token")
      result.message = "정상적이지 않은 접근입니다";
    else result.message = e.message;

    res.send(result);
  }
};
module.exports = checkLogin;
