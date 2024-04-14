const router = require("express").Router();
const pool = require("../../database/connect/postgresql");
const checkDuplicatedId = require("../middlewares/checkDuplicatedId");
const makeAccessToken = require("../utils/makeAccessToken");
const makeRefreshToken = require("../utils/makeRefreshToken");
const checkLogin = require("../middlewares/checkLogin");
const { body } = require("express-validator");
const validate = require("../middlewares/validationResult");
const todayVisitorModule = require("../utils/todayVisitorModule");
const loginUserListModule = require("../utils/loginUserListModule");
const upload = require("../middlewares/multer");
const multer = require("multer");
const multerS3 = require("../middlewares/multerS3");
const aws = require("aws-sdk");

// router.post("/uploads", multerS3.single("images"), async (req, res, next) => {
//   const result = {
//     success: false,
//     data: {},
//   };
//   try {
//     console.log(req.file.location);
//     result.success = true;
//     res.result = result;
//     res.send(result);
//   } catch (e) {
//     console.log(e);
//     return next(e);
//   }
// });
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

      const account = selectAccountQueryResult.rows[0];
      if (!account) {
        const error = new Error();
        error.message = "아이디/비밀번호가 일치하지 않습니다.";
        error.status = 401;
        throw error;
      }

      //성공 시 토큰 발행
      const accessToken = makeAccessToken({
        idx: account.idx,
        nickname: account.nickname,
        rank: account.rank,
      });
      const refreshToken = makeRefreshToken({
        idx: account.idx,
        nickname: account.nickname,
        rank: account.rank,
      });

      todayVisitorModule();
      loginUserListModule(account);

      res.cookie("access_token", accessToken);
      res.cookie("refresh_token", refreshToken);

      result.success = true;
      res.result = result;
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
    const loginUser = req.decoded;

    res.clearCookie("access_token");

    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//회원 가입
router.post(
  "/",
  //   upload.single("images"),
  multerS3.single("images"),
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
    console.log(id);
    const result = {
      success: false,
      data: {},
    };
    try {
      if (req.file === undefined || req.file === null || req.file === "") {
        await pool.query(
          `INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, pw, name, birth, phoneNumber, email, nickname, gender]
        );
      } else {
        const filePath = req.file.location;
        await pool.query(
          `INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender, profile_image) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, pw, name, birth, phoneNumber, email, nickname, gender, filePath]
        );
      }

      // 결과 전송
      result.success = true;
      res.result = result;
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
    const s3 = new aws.S3();

    const loginUser = req.decoded;

    const profileURL = await pool.query(
      `DELETE FROM backend.account WHERE idx = $1 RETURNING profile_image`,
      [loginUser.idx]
    );
    await s3.deleteObject(
      {
        Bucket: process.env.BUCKET_NAME,
        Key: "1712945801078_인겜 1주차.jpg",
      },
      function (err, data) {
        if (err) {
          console.log(err);
        }
      }
    );
    res.clearCookie("access_token");

    result.success = true;
    res.result = result;
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
      if (!account) {
        const error = new Error("일치하는 아이디가 없습니다.");
        error.status = 404;
        throw error;
      }

      result.success = true;
      result.data = account;
      res.result = result;
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
      if (!account) {
        const error = new Error("일치하는 비밀번호가 없습니다.");
        error.status = 404;
        throw error;
      }

      result.success = true;
      result.data = account;
      res.result = result;
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
    const loginUser = req.decoded;
    const selectAccountQueryResult = await pool.query(
      `SELECT id, password, name, birth, phonenumber, email, nickname, gender, profile_image FROM backend.account WHERE idx = $1`,
      [loginUser.idx]
    );

    const account = selectAccountQueryResult.rows[0];
    if (!account) {
      const error = new Error("계정을 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }
    result.success = true;
    result.data = account;
    res.result = result;
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
      const loginUser = req.decoded;

      if (req.file === undefined || req.file === null || req.file === "") {
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
      } else {
        const filePath = req.file.location;
        await pool.query(
          `UPDATE backend.account SET id =$1, password=$2, name=$3, birth=$4, phonenumber=$5, email=$6, nickname=$7, gender=$8,profile_image =$9 WHERE idx =$10`,
          [
            id,
            pw,
            name,
            birth,
            phoneNumber,
            email,
            nickname,
            gender,
            filePath,
            loginUser.idx,
          ]
        );
      }

      result.success = true;
      res.result = result;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//export 작업
module.exports = router;
