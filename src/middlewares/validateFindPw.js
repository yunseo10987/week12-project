const regId = /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/;
const regNum = /^\d{3}-\d{3,4}-\d{4}$/;

const validateFindPw = (req, res, next) => {
  const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
    req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    if (id === null || id === undefined || id === "") {
      throw new Error("아이디를 입력하세요");
    }
    if (
      phoneNumber === null ||
      phoneNumber === undefined ||
      phoneNumber === ""
    ) {
      throw new Error("전화번호를 입력하세요");
    }

    if (!regId.test(id)) {
      throw new Error("아이디를 다시 확인해주세요");
    }

    if (!regNum.test(phoneNumber)) {
      throw new Error("전화번호를 다시 확인해주세요");
    }

    next();
  } catch (e) {
    result.message = e.message;
    res.send(result);
  }
};

module.exports = validateFindPw;
