const router = require("express").Router();
const pool = require("../../database/connect/postgresql");
const checkDuplicatedId = require("../middlewares/checkDuplicatedId");
const makeAccessToken = require("../utils/makeAccessToken");
const makeRefreshToken = require("../utils/makeRefreshToken");
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");
const requestIp = require("request-ip");
const loggingModel = require("../mongooseSchema/loggingSchema");
const { body } = require("express-validator");
const validate = require("../middlewares/validationResult");

//로그인
router.post(
  "/login",
  body("id")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/)
    .withMessage("아이디를 확인해주세요"),
  body("pw")
    .trim()
    .matches(
      /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
    )
    .withMessage("비밀번호를 확인해주세요"),
  validate,
  async (req, res, next) => {
    const { id, pw } = req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      //DB에서 아이디 비밀번호 확인
      const selectAccountQueryResult = await pool.query(
        `SELECT idx, nickname,rank FROM backend.account WHERE id = $1 AND password = $2`,
        [id, pw]
      );
      const account = selectAccountQueryResult.rows;
      if (!account.length) {
        throw new Error("아이디/비밀번호가 일치하지 않습니다.");
      }

      //성공 시 토큰 발행
      const accessToken = makeAccessToken({
        idx: account.idx,
        nickname: account.nickname,
        admin: false,
      });
      const refreshToken = makeRefreshToken({
        idx: account.idx,
        nickname: account.nickname,
        admin: false,
      });
      console.log(account.rank);

      if (account.rank === "admin") {
        accessToken.admin = true;
        refreshToken.admin = true;
      }
      res.cookie("access_token", accessToken);
      res.cookie("refresh_token", refreshToken);

      result.success = true;
      res.send(result);
    } catch (e) {
      console.log(e);
      return next(e);
    }
  }
);

//로그아웃
router.delete("/logout", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.loginUser;

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
router.post(
  "/",
  body("id")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/)
    .withMessage("아이디를 확인해주세요"),
  body("pw")
    .trim()
    .matches(
      /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
    )
    .withMessage("비밀번호를 확인해주세요"),
  body("name").trim().isLength({ min: 1, max: 12 }),
  body("birth")
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/),
  body("phoneNumber")
    .trim()
    .matches(/^\d{3}-\d{3,4}-\d{4}$/),
  body("email")
    .trim()
    .matches(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/)
    .isLength({ max: 28 }),
  body("nickname").trim().isLength({ min: 1, max: 12 }),
  body("gender").trim().isIn(["male", "female"]),
  checkDuplicatedId,
  validate,
  async (req, res, next) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
      req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      //db 연결
      await pool.query(
        `INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, pw, name, birth, phoneNumber, email, nickname, gender]
      );

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
  }
);

//회원 탈퇴
router.delete("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.loginUser;

    await pool.query(`DELETE FROM backend.account WHERE idx = $1`, [
      loginUser.idx,
    ]);
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
router.get(
  "/find-id",
  body("phoneNumber")
    .trim()
    .matches(/^\d{3}-\d{3,4}-\d{4}$/),
  body("email")
    .trim()
    .matches(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/)
    .isLength({ max: 28 }),
  validate,
  async (req, res, next) => {
    const { phoneNumber, email } = req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      //db 연동
      const selectAccountQueryResult = await pool.query(
        `SELECT id FROM backend.account WHERE email =$1 AND phonenumber =$2`,
        [email, phoneNumber]
      );
      const account = selectAccountQueryResult.rows[0];
      if (!account.length) {
        throw new Error("일치하는 아이디가 없습니다.");
      }
      await loggingModel.create({
        type: "GET/ account/find-id",
        client: "null",
        client_ip: requestIp.getClientIp(req),
        request: req.body,
        response: {
          success: true,
          data: account,
        },
      });
      result.success = true;
      result.data = account;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//비밀번호 찾기
router.get(
  "/find-pw",
  body("id")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/)
    .withMessage("아이디를 확인해주세요"),
  body("phoneNumber")
    .trim()
    .matches(/^\d{3}-\d{3,4}-\d{4}$/),
  validate,
  async (req, res, next) => {
    const { id, phoneNumber } = req.body;
    const result = {
      success: false,
      data: {},
    };
    try {
      const selectAccountQueryResult = await pool.query(
        `SELECT password FROM backend.account WHERE id =$1 AND phonenumber =$2`,
        [id, phoneNumber]
      );
      const account = selectAccountQueryResult.rows[0];
      if (!account.length) {
        throw new Error("일치하는 비밀번호가 없습니다");
      }

      await loggingModel.create({
        type: "GET/ account/find-pw",
        client: "null",
        client_ip: requestIp.getClientIp(req),
        request: req.body,
        response: {
          success: true,
          data: account,
        },
      });

      result.success = true;
      result.data = account;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//내 정보 보기
router.get("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.loginUser;
    const selectAccountQueryResult = await pool.query(
      `SELECT id, password, name, birth, phonenumber, email, nickname, gender FROM backend.account WHERE idx = $1`,
      [loginUser.idx]
    );

    const account = selectAccountQueryResult.rows[0];
    if (!account.length) {
      throw new Error("일치하는 정보가 없습니다.");
    }
    await loggingModel.create({
      type: "GET/ account",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: account,
      },
    });
    result.success = true;
    result.data = account;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//내 정보 수정
router.put(
  "/",
  checkLogin,
  checkDuplicatedId,
  body("id")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/)
    .withMessage("아이디를 확인해주세요"),
  body("pw")
    .trim()
    .matches(
      /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
    )
    .withMessage("비밀번호를 확인해주세요"),
  body("name").trim().isLength({ min: 1, max: 12 }),
  body("birth")
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/),
  body("phoneNumber")
    .trim()
    .matches(/^\d{3}-\d{3,4}-\d{4}$/),
  body("email")
    .trim()
    .matches(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/)
    .isLength({ max: 28 }),
  body("nickname").trim().isLength({ min: 1, max: 12 }),
  body("gender").trim().isIn(["male", "female"]),
  validate,
  async (req, res, next) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender } =
      req.body;
    const sql = "";
    const result = {
      success: false,
      data: {},
    };

    try {
      const loginUser = req.loginUser;

      //db 연결
      await pool.query(
        `UPDATE backend.account SET id =$1, password=$2, name=$3, birth=$4, phonenumber=$5, email=$6, nickname=$7, gender=$8 WHERE idx =$9`,
        [
          id,
          pw,
          name,
          birth,
          phoneNumber,
          email,
          nickname,
          gender,
          loginUser.idx,
        ]
      );

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
