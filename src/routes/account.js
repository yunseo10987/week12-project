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
const requestIp = require("request-ip");
const loggingModel = require("../mongooseSchema/loggingSchema");

//로그인
router.post("/login", validateLogin, async (req, res, next) => {
  const { id, pw } = req.body;
  const sql =
    "SELECT idx, nickname FROM backend.account WHERE id = $1 AND password = $2";
  const result = {
    success: false,
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
      admin: false,
    });
    const refreshToken = makeRefreshToken({
      idx: account.rows[0].idx,
      nickname: account.rows[0].nickname,
      admin: false,
    });

    const isAdmin = await pool.query(
      `SELECT idx FROM backend.admin WHERE account_idx = $1`,
      [account.rows[0].idx]
    );
    if (isAdmin.length) {
      accessToken.admin = true;
      refreshToken.admin = true;
    }

    res.cookie("access_token", accessToken);
    res.cookie("refresh_token", refreshToken);

    await loggingModel.create({
      type: "POST/ account/login",
      client: "null",
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: {},
      },
    });
    result.success = true;
    res.send(result);
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

//로그아웃
router.delete("/logout", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);

    res.clearCookie("access_token");
    await loggingModel.create({
      type: "DELETE/ account/logout",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: {},
      },
    });
    result.success = true;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//회원 가입
router.post("/", validateSignUp, checkDuplicatedId, async (req, res, next) => {
  const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
    req.body;
  const sql =
    "INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
  const result = {
    success: false,
    data: {},
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

    await loggingModel.create({
      type: "POST/ account",
      client: "null",
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: {},
      },
    });

    // 결과 전송
    result.success = true;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//회원 탈퇴
router.delete("/", checkLogin, async (req, res, next) => {
  const sql = "DELETE FROM backend.account WHERE idx = $1";
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);

    await pool.query(sql, [loginUser.idx]);
    res.clearCookie("access_token");
    await loggingModel.create({
      type: "DELETE/ account",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: {},
      },
    });
    result.success = true;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//아이디 찾기
router.get("/find-id", validateFindId, async (req, res, next) => {
  const { phoneNumber, email } = req.query;
  const sql =
    "SELECT id FROM backend.account WHERE email =$1 AND phonenumber =$2";
  const result = {
    success: false,
    data: {},
  };

  try {
    //db 연동
    const account = await pool.query(sql, [email, phoneNumber]);
    if (!account.rows.length) {
      throw new Error("일치하는 아이디가 없습니다.");
    }
    await loggingModel.create({
      type: "GET/ account/find-id",
      client: "null",
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: account.rows,
      },
    });
    result.success = true;
    result.data = account.rows;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//비밀번호 찾기
router.get("/find-pw", validateFindPw, async (req, res, next) => {
  const { id, phoneNumber } = req.query;
  const sql =
    "SELECT password FROM backend.account WHERE id =$1 AND phonenumber =$2";
  const result = {
    success: false,
    data: {},
  };
  try {
    const account = await pool.query(sql, [id, phoneNumber]);
    if (!account.rows.length) {
      throw new Error("일치하는 비밀번호가 없습니다");
    }

    await loggingModel.create({
      type: "GET/ account/find-pw",
      client: "null",
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: account.rows,
      },
    });

    result.success = true;
    result.data = account.rows;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//내 정보 보기
router.get("/", checkLogin, async (req, res, next) => {
  const sql =
    "SELECT id, password, name, birth, phonenumber, email, nickname, gender FROM backend.account WHERE idx = $1";
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);
    const account = await pool.query(sql, [loginUser.idx]);

    if (!account.rows.length) {
      throw new Error("일치하는 정보가 없습니다.");
    }
    await loggingModel.create({
      type: "GET/ account",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: account.rows,
      },
    });
    result.success = true;
    result.data = account.rows;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//내 정보 수정
router.put(
  "/",
  checkLogin,
  validateSignUp,
  checkDuplicatedId,
  async (req, res, next) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
      req.body;
    const sql =
      "UPDATE backend.account SET id =$1, password=$2, name=$3, birth=$4, phonenumber=$5, email=$6, nickname=$7, gender=$8 WHERE idx =$9";
    const result = {
      success: false,
      data: {},
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

      await loggingModel.create({
        type: "PUT/ account",
        client: loginUser.idx,
        client_ip: requestIp.getClientIp(req),
        request: req.body,
        response: {
          success: true,
          data: {},
        },
      });

      result.success = true;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//export 작업
module.exports = router;
