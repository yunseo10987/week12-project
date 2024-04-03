const express = require("express");
const router = express.Router();
const pool = require("../../database/connect/postgresql");
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");
const loggingModel = require("../mongooseSchema/loggingSchema");
const requestIp = require("request-ip");
const { body } = require("express-validator");
const validate = require("../middlewares/validationResult");

//댓글 쓰기
router.post(
  "/",
  checkLogin,
  body("comment").isLength({ min: 1, max: 500 }),
  validate,
  async (req, res, next) => {
    const { content, postIdx } = req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      const loginUser = req.loginUser;

      await pool.query(
        `INSERT INTO backend.comment(content, post_idx, account_idx) VALUES($1, $2, $3)`,
        [content, postIdx, loginUser.idx]
      );
      const selectPostQueryResult = await pool.query(
        "SELECT account_idx FROM backend.post WHERE idx = $1",
        [postIdx]
      );
      const postWriter = selectPostQueryResult.rows[0].account_idx;
      if (postWriter !== loginUser.idx) {
        await notification.create({
          type: "individual",
          writer: loginUser.nickname,
          data: {
            postIdx: postIdx,
          },
          receiver: postWriter,
          is_read: false,
        });
      }
      await loggingModel.create({
        type: "POST/ comment",
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

//댓글/대댓글 읽기 ..보류

router.get("/", async (req, res, next) => {
  //path parameter는 앞의 이름의 idx가 일반적, body로 받아야함
  const sql = `SELECT C.idx, C.content, C.created_at, C.account_idx, C.comment_likes, A.nickname
          FROM backend.comment C JOIN backend.account A ON C.account_idx = A.idx
          WHERE C.post_idx = $1 ORDER BY C.idx LIMIT 5 OFFSET($2 -1) * 5`;
  const { postIdx, pageNumber } = req.body;
  const result = {
    success: false,
    data: {},
  };
  try {
    const comment = await pool.query(sql, [postIdx, pageNumber]);
    result.success = true;
    result.data = comment.rows;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//댓글 수정
router.put(
  "/",
  checkLogin,
  body("comment").isLength({ min: 1, max: 500 }),
  validate,
  async (req, res, next) => {
    const { content, commentIdx } = req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      const loginUser = req.loginUser;

      await query(
        `UPDATE backend.comment SET content=$1 WHERE idx = $2 AND account_idx =$3`,
        [content, commentIdx, loginUser.idx]
      );

      await loggingModel.create({
        type: "PUT/ comment",
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

//댓글 삭제
router.delete("/", checkLogin, async (req, res, next) => {
  const { commentIdx } = req.body;
  const result = {
    success: false,
    message: "",
  };

  try {
    const loginUser = req.loginUser;

    await query(
      `DELETE FROM backend.comment WHERE idx = $1 AND account_idx =$2`,
      [commentIdx, loginUser.idx]
    );
    await loggingModel.create({
      type: "DELETE/ comment",
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
    next(e);
  }
});

//댓글 좋아요
router.put("/likes", checkLogin, async (req, res, next) => {
  const { commentIdx } = req.body;
  const result = {
    success: false,
    data: {},
  };
  const poolClient = pool.connect();
  try {
    const loginUser = req.loginUser;

    await poolClient.query("BEGIN");
    const isLikers = await poolClient.query(
      `SELECT idx FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2`,
      [commentIdx, loginUser.idx]
    );
    if (isLikers.rows) {
      await poolClient.query(
        `DELETE FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.comment SET comment_likes = comment_likes - 1 WHERE idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );

      result.message = "좋아요 취소";
    } else {
      await poolClient.query(
        `INSERT INTO backend.comment_likes(comment_idx, account_idx) VALUES($1, $2)`,
        [commentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.comment SET comment_likes = comment_likes + 1 WHERE idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );

      result.message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");
    (await poolClient).release();

    await loggingModel.create({
      type: "PUT/ comment/likes",
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
    await poolClient.query("ROLLBACK");
    (await poolClient).release();
    return next(e);
  } finally {
  }
});

module.exports = router;
