const express = require("express");
const router = express.Router();
const pool = require("../../database/connect/postgresql");
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");

//대댓글 쓰기
router.post("/", checkLogin, async (req, res, next) => {
  const { content, postIdx, commentIdx } = req.body;

  try {
    const loginUser = req.decoded;

    await pool.query(
      `INSERT INTO backend.reply_comment(content, post_idx, account_idx, comment_idx) VALUES($1, $2, $3, $4)`,
      [content, postIdx, loginUser.idx, commentIdx]
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

    res.send({
      success: true,
      data: {},
    });
  } catch (e) {
    return next(e);
  }
});

//대댓글 수정
router.put("/", checkLogin, async (req, res, next) => {
  //로그인한 이용자가 댓글 작성자와 다를 수도 있기 때문에
  const { content, replyCommentIdx } = req.body;

  try {
    const loginUser = req.decoded;

    await query(
      `UPDATE backend.reply_comment SET content=$1 WHERE idx = $2 AND account_idx = $3`,
      [content, replyCommentIdx, loginUser.idx]
    );

    res.send({
      success: true,
      data: {},
    });
  } catch (e) {
    return next(e);
  }
});

//대댓글 삭제
router.delete("/", checkLogin, async (req, res, next) => {
  const { replyCommentIdx } = req.body;

  try {
    const loginUser = req.decoded;

    await query(
      `DELETE FROM backend.reply_comment WHERE idx = $1 AND account_idx = $2`,
      [replyCommentIdx, loginUser.idx]
    );

    res.send({
      success: true,
      data: {},
    });
  } catch (e) {
    return next(e);
  }
});

//대댓글 좋아요
router.put("/likes", checkLogin, async (req, res, next) => {
  const { replyCommentIdx } = req.body;
  const poolClient = pool.connect();
  const message = null;

  try {
    const loginUser = req.decoded;

    await poolClient.query("BEGIN");
    const isLikers = await poolClient.query(
      `SELECT idx FROM backend.reply_comment_likes WHERE comment_idx = $1 AND account_idx = $2`,
      [replyCommentIdx, loginUser.idx]
    );
    if (isLikers.rows) {
      await poolClient.query(
        `DELETE FROM backend.reply_comment_likes WHERE reply_comment_idx = $1 AND account_idx = $2`,
        [replyCommentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.reply_comment SET reply_comment_likes = reply_comment_likes - 1 WHERE idx = $1 AND account_idx = $2`,
        [replyCommentIdx, loginUser.idx]
      );

      message = "좋아요 취소";
    } else {
      await poolClient.query(
        `INSERT INTO backend.reply_comment_likes(reply_comment_idx, account_idx) VALUES($1, $2)`,
        [commentIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.reply_comment SET reply_comment_likes = reply_comment_likes + 1 WHERE idx = $1 AND account_idx = $2`,
        [replyCommentIdx, loginUser.idx]
      );

      message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");
    await poolClient.release();

    res.send({
      success: true,
      data: {},
    });
  } catch (e) {
    await poolClient.query("ROLLBACK");
    await poolClient.release();
    return next(e);
  }
});

module.exports = router;
