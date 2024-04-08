const jwt = require("jsonwebtoken");
const router = require("../routes/account");

router.post("/", async (req, res) => {
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
        admin: token.admin,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        issuer: "stageus",
        expiresIn: "1h",
      }
    );
    res.cookie("access_token", accessToken);
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

module.exports = router;
