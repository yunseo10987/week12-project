const express = require("express");
const router = express.Router();
const pool = require("../../database/connect/postgresql");
const checkLogin = require("../middlewares/checkLogin");
const { body } = require("express-validator");
const validate = require("../middlewares/validationResult");
const makeNotification = require("../utils/makeNotificationModule");
const { NotFoundException } = require("../utils/Exception");

//댓글 쓰기
router.post(
  "/",
  checkLogin,
  body("comment").isLength({ min: 1, max: 500 }),
  validate,
  async (req, res, next) => {
    const { content, postIdx } = req.body;

    try {
      const loginUser = req.decoded;

      const selectPostQueryResult = await pool.query(
        "SELECT account_idx FROM backend.post WHERE idx = $1",
        [postIdx]
      );
      const postWriterIdx = selectPostQueryResult.rows[0].account_idx;
      if (
        postWriterIdx === null ||
        postWriterIdx === undefined ||
        postWriterIdx === ""
      ) {
        throw new NotFoundException("게시물을 찾을 수 없습니다.");
      }

      await pool.query(
        `INSERT INTO backend.comment(content, post_idx, account_idx) VALUES($1, $2, $3)`,
        [content, postIdx, loginUser.idx]
      );

      if (postWriterIdx !== loginUser.idx) {
        makeNotification(
          "individual",
          loginUser.nickname,
          { postIdx: postIdx },
          postWriterIdx
        );
      }

      res.send({
        success: true,
        data: {},
      });
    } catch (e) {
      return next(e);
    }
  }
);

//댓글/대댓글 읽기 ..보류

router.get("/", async (req, res, next) => {
  //path parameter는 앞의 이름의 idx가 일반적, body로 받아야함
  const { postIdx, pageNumber } = req.body;

  try {
    const comment = await pool.query(
      `SELECT C.idx, C.content, C.created_at, C.account_idx, C.comment_likes, A.nickname
    FROM backend.comment C JOIN backend.account A ON C.account_idx = A.idx
    WHERE C.post_idx = $1 ORDER BY C.idx LIMIT 5 OFFSET($2 -1) * 5`,
      [postIdx, pageNumber]
    ).rows;

    res.send({
      success: true,
      data: comment,
    });
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

    try {
      const loginUser = req.decoded;

      await query(
        `UPDATE backend.comment SET content=$1 WHERE idx = $2 AND account_idx =$3`,
        [content, commentIdx, loginUser.idx]
      );

      res.send({
        success: true,
        data: {},
      });
    } catch (e) {
      return next(e);
    }
  }
);

//댓글 삭제
router.delete("/", checkLogin, async (req, res, next) => {
  const { commentIdx } = req.body;

  try {
    const loginUser = req.decoded;

    await query(
      `DELETE FROM backend.comment WHERE idx = $1 AND account_idx =$2`,
      [commentIdx, loginUser.idx]
    );

    res.send({
      success: true,
      data: {},
    });
  } catch (e) {
    next(e);
  }
});

//댓글 좋아요
router.put("/likes", checkLogin, async (req, res, next) => {
  const { commentIdx } = req.body;
  const poolClient = pool.connect();
  const message = null;
  try {
    const loginUser = req.decoded;

    await poolClient.query("BEGIN");
    const commentLikeState = await poolClient.query(
      `SELECT idx FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2`,
      [commentIdx, loginUser.idx]
    ).rows[0];

    if (commentLikeState === undefined || commentLikeState === "") {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }
    if (commentLikeState) {
      await poolClient.query(
        `DELETE FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.comment SET comment_likes = comment_likes - 1 WHERE idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );

      message = "좋아요 취소";
    } else {
      await poolClient.query(
        `INSERT INTO backend.comment_likes(comment_idx, account_idx) VALUES($1, $2)`,
        [commentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.comment SET comment_likes = comment_likes + 1 WHERE idx = $1 AND account_idx = $2`,
        [commentIdx, loginUser.idx]
      );

      message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");
    (await poolClient).release();

    res.send({
      success: true,
      data: {},
      message: message,
    });
  } catch (e) {
    await poolClient.query("ROLLBACK");
    (await poolClient).release();
    return next(e);
  }
});

module.exports = router;
