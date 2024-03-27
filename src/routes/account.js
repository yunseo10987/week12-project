const router = require("express").Router();
const pool = require("../../database/connect/postgresql");
const checkDuplicatedId = require("../middlewares/checkDuplicatedId");
const validateSignUp = require("../middlewares/validateSignUp");
const validateFindId = require("../middlewares/validateFindId");
const validateFindPw = require("../middlewares/validateFindPw");
const validateLogin = require("../middlewares/validateLogin");
const makeAccessToken = require("../utils/makeAccessToken");
const makeRefreshToken = require("../utils/makeRefreshToken");
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");

//로그인
router.post("/login", validateLogin, async (req, res) => {
  const { id, pw } = req.body;
  const sql =
    "SELECT idx, nickname FROM backend.account WHERE id = $1 AND password = $2";
  const result = {
    success: false,
    message: "",
    data: {},
  };

  try {
    //DB에서 아이디 비밀번호 확인
    const account = await pool.query(sql, [id, pw]);
    if (!account.rows.length) {
      throw new Error("아이디/비밀번호가 일치하지 않습니다.");
    }
    //성공 시 토큰 발행
    const accessToken = makeAccessToken({
      idx: account.rows[0].idx,
      nickname: account.rows[0].nickname,
    });
    const refreshToken = makeRefreshToken({
      idx: account.rows[0].idx,
      nickname: account.rows[0].nickname,
    });
    res.cookie("access_token", accessToken);
    res.cookie("refresh_token", refreshToken);
    result.success = true;
  } catch (e) {
    console.log(e);
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//로그아웃
router.delete("/logout", checkLogin, (req, res) => {
  const result = {
    success: false,
    message: "",
  };

  try {
    res.clearCookie("access_token");
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//회원 가입
router.post("/", validateSignUp, checkDuplicatedId, async (req, res) => {
  const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
    req.body;
  const sql =
    "INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
  const result = {
    success: false,
    message: "",
  };

  try {
    //db 연결
    await pool.query(sql, [
      id,
      pw,
      name,
      birth,
      phoneNumber,
      email,
      nickname,
      gender,
    ]);

    // 결과 전송
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//회원 탈퇴
router.delete("/", checkLogin, async (req, res) => {
  const sql = "DELETE FROM backend.account WHERE idx = $1";
  const result = {
    success: false,
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);

    await pool.query(sql, [loginUser.idx]);
    res.clearCookie("access_token");
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//아이디 찾기
router.get("/find-id", validateFindId, async (req, res) => {
  const { phoneNumber, email } = req.query;
  const sql =
    "SELECT id FROM backend.account WHERE email =$1 AND phonenumber =$2";
  const result = {
    success: false,
    message: "",
    data: "",
  };

  try {
    //db 연동
    const account = await pool.query(sql, [email, phoneNumber]);
    if (!account.rows.length) {
      throw new Error("일치하는 아이디가 없습니다.");
    }

    result.success = true;
    result.data = account.rows;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//비밀번호 찾기
router.get("/find-pw", validateFindPw, async (req, res) => {
  const { id, phoneNumber } = req.query;
  const sql =
    "SELECT password FROM backend.account WHERE id =$1 AND phonenumber =$2";
  const result = {
    success: false,
    message: "",
    data: "",
  };
  try {
    const account = await pool.query(sql, [id, phoneNumber]);
    if (!account.rows.length) {
      throw new Error("일치하는 비밀번호가 없습니다");
    }

    result.success = true;
    result.data = account.rows;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//내 정보 보기
router.get("/", checkLogin, async (req, res) => {
  const sql =
    "SELECT id, password, name, birth, phonenumber, email, nickname, gender FROM backend.account WHERE idx = $1";
  const result = {
    success: false,
    message: "",
    data: "",
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);
    const account = await pool.query(sql, [loginUser.idx]);

    if (!account.rows.length) {
      throw new Error("일치하는 정보가 없습니다.");
    }
    result.success = true;
    result.data = account.rows;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//내 정보 수정
router.put(
  "/",
  checkLogin,
  validateSignUp,
  checkDuplicatedId,
  async (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
      req.body;
    const sql =
      "UPDATE backend.account SET id =$1, password=$2, name=$3, birth=$4, phonenumber=$5, email=$6, nickname=$7, gender=$8 WHERE idx =$9";
    const result = {
      success: false,
      message: "",
    };

    try {
      const loginUser = jwt.decode(req.cookies.access_token);

      //db 연결
      await pool.query(sql, [
        id,
        pw,
        name,
        birth,
        phoneNumber,
        email,
        nickname,
        gender,
        loginUser.idx,
      ]);

      result.success = true;
    } catch (e) {
      result.message = e.message;
    } finally {
      res.send(result);
    }
  }
);

//export 작업
module.exports = router;
