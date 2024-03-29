const regId = /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/;
const regPw =
  /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;

const validateLogin = (req, res, next) => {
  const { id, pw } = req.body;

  try {
    if (id === null || id === undefined || id === "") {
      throw new Error("아이디를 입력하세요");
    }
    if (pw === null || pw === undefined || pw === "") {
      throw new Error("비밀번호를 입력하세요");
    }

    if (!regId.test(id)) {
      throw new Error("아이디를 다시 확인해주세요");
    }
    if (!regPw.test(pw)) {
      throw new Error("비밀번호를 다시 확인해주세요");
    }

    next();
  } catch (e) {
    e.api = "middlewares";
    next(e);
  }
};

module.exports = validateLogin;
