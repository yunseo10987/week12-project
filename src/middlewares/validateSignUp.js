const regId = /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/;
const regPw =
  /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;
const regNum = /^\d{3}-\d{3,4}-\d{4}$/;
const regEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
const regBirth = /^\d{4}-\d{2}-\d{2}$/;

const validateSignUp = (req, res, next) => {
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
    if (pw === null || pw === undefined || pw === "") {
      throw new Error("비밀번호를 입력하세요");
    }
    if (name === null || name === undefined || name === "") {
      throw new Error("이름을 입력하세요");
    }
    if (birth === null || birth === undefined || birth === "") {
      throw new Error("생년월일을 입력하세요");
    }
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
    if (nickname === null || nickname === undefined || nickname === "") {
      throw new Error("닉네임을 입력하세요");
    }
    if (gender === null || gender === undefined || gender === "") {
      throw new Error("성별을 입력하세요");
    }

    if (!regId.test(id)) {
      throw new Error("아이디를 다시 확인해주세요");
    }
    if (!regPw.test(pw)) {
      throw new Error("비밀번호를 다시 확인해주세요");
    }
    if (name.legnth > 12 || name.legnth < 1) {
      throw new Error("이름을 다시 확인해주세요");
    }
    if (!regBirth.test(birth)) {
      throw new Error("생년월일을 다시 확인해주세요");
    }
    if (!regNum.test(phoneNumber)) {
      throw new Error("전화번호를 다시 확인해주세요");
    }
    if (!regEmail.test(email) || email.legnth > 28) {
      throw new Error("이메일을 다시 확인해주세요");
    }
    if (nickname.legnth > 12 || nickname.legnth < 1) {
      throw new Error("닉네임을 다시 확인해주세요");
    }
    if (gender != "male" && gender != "female") {
      throw new Error("성별을 다시 확인해주세요");
    }

    next();
  } catch (e) {
    result.message = e.message;
    res.send(result);
  }
};

module.exports = validateSignUp;
