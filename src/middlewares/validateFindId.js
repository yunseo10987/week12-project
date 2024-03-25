const regNum = /^\d{3}-\d{3,4}-\d{4}$/;
const regEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;

const validateFindId = (req, res, next) => {
  const { phoneNumber, email } = req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    if (
      phoneNumber === null ||
      phoneNumber === undefined ||
      phoneNumber === ""
    ) {
      throw new Error("전화번호를 입력하세요");
    }
    if (email === null || email === undefined || email === "") {
      throw new Error("이메일을 입력하세요");
    }

    if (!regNum.test(phoneNumber)) {
      throw new Error("전화번호를 다시 확인해주세요");
    }
    if (!regEmail.test(email) || email.legnth > 28) {
      throw new Error("이메일을 다시 확인해주세요");
    }

    next();
  } catch (e) {
    result.message = e.message;
    res.send(result);
  }
};

module.exports = validateFindId;
