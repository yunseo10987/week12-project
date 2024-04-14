const express = require("express");
const router = express.Router();
const pool = require("../../database/connect/postgresql");
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const validate = require("../middlewares/validationResult");
const makeNotification = require("../utils/makeNotificationModule");

//게시글 전체 목록
router.get("/all", async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    const post = await pool.query(`
      SELECT P.idx, P.created_at, PC.name, P.title, P.idx 
      FROM backend.post P 
      LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx 
      ORDER BY P.idx DESC`);

    result.data = post.rows;
    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//게시글 쓰기
router.post(
  "/",
  checkLogin,
  body("title").isLength({ min: 1, max: 50 }),
  body("content").isLength({ min: 1, max: 1500 }),
  validate,
  async (req, res, next) => {
    const { title, content, category } = req.body;
    const result = {
      success: false,
      data: {},
    };

    try {
      const loginUser = req.decoded;

      const insertPostQueryResult = await pool.query(
        `INSERT INTO backend.post(title, content, account_idx, post_category_idx) VALUES($1, $2, $3, $4) RETURNING idx`,
        [title, content, loginUser.idx, category]
      );
      const postIdx = insertPostQueryResult.rows[0].idx;
      const nickname = loginUser.nickname;

      makeNotification("global", nickname, { postIdx: postIdx });

      result.success = true;
      res.result = result;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//게시글 읽기
router.get("/:postIdx", async (req, res, next) => {
  const { postIdx } = req.params;

  const result = {
    success: false,
    data: {},
  };
  try {
    const selectQueryResult = await pool.query(
      `
      SELECT P.title, P.created_at,P.content,P.post_likes, A.idx, A.nickname, PC.name
      FROM backend.post P 
      LEFT OUTER JOIN backend.account A ON P.account_idx = A.idx
      LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx
      WHERE P.idx = $1
    `,
      [postIdx]
    );
    const post = selectQueryResult.rows[0];
    if (!post) {
      const error = new Error();
      error.status = 404;
      error.message = "게시물을 찾을 수 없습니다.";
      throw error;
    }

    result.success = true;
    result.data = post;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

// const wrapper = (requestHandler) => {
//   return async (req, res, next) => {
//     try {
//       await requestHandler(req, res, next);
//     } catch (err) {
//       return next(err);
//     }
//   };
// };

//게시글 수정
router.put(
  "/",
  checkLogin,
  body("title").isLength({ min: 1, max: 50 }),
  body("content").isLength({ min: 1, max: 1500 }),
  validate,
  async (req, res, next) => {
    const { postIdx } = req.body;
    const { title, content, category } = req.body;
    const result = {
      success: false,
      data: {},
    };
    try {
      const loginUser = req.decoded;

      await pool.query(
        `UPDATE backend.post SET title=$1, content=$2,post_category_idx=$3 WHERE idx = $4 AND account_idx = $5`,
        [title, content, category, postIdx, loginUser.idx]
      );

      result.success = true;
      res.result = result;
      res.send(result);
    } catch (e) {
      return next(e);
    }
  }
);

//게시글 삭제
router.delete("/", checkLogin, async (req, res, next) => {
  const { postIdx } = req.body;
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.decoded;

    await pool.query(
      `DELETE FROM backend.post WHERE idx = $1 AND account_idx = $2`,
      [postIdx, loginUser.idx]
    );

    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

//게시물 좋아요
router.put("/likes", checkLogin, async (req, res, next) => {
  const { postIdx } = req.body;
  const result = {
    success: false,
    data: {},
  };
  const poolClient = await pool.connect();

  try {
    const loginUser = req.decoded;
    const nickname = loginUser.nickname;

    await poolClient.query("BEGIN");
    const selectPostLikeQueryResult = await poolClient.query(
      `SELECT idx FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2`,
      [postIdx, loginUser.idx]
    );
    const postLikeState = selectPostLikeQueryResult.rows[0];

    if (postLikeState) {
      await poolClient.query(
        `DELETE FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2`,
        [postIdx, loginUser.idx]
      );
      await poolClient.query(
        `UPDATE backend.post SET post_likes = post_likes - 1 WHERE idx = $1`,
        [postIdx]
      );

      result.message = "좋아요 취소";
    } else {
      await poolClient.query(
        `INSERT INTO backend.post_likes(post_idx, account_idx) VALUES($1, $2)`,
        [postIdx, loginUser.idx]
      );
      const updatePostQueryResult = await poolClient.query(
        `UPDATE backend.post SET post_likes = post_likes + 1 WHERE idx = $1 RETURNING account_idx`,
        [postIdx]
      );

      const postWriter = updatePostQueryResult.rows[0].account_idx;
      if (postWriter !== loginUser.idx) {
        await notification.create({
          type: "individual",
          writer: nickname,
          data: {
            postLikers: loginUser.idx,
          },
          receiver: postWriter,
          is_read: false,
        });
        makeNotification(
          "individual",
          nickname,
          { postLikers: loginUser.idx },
          postWriter
        );
      }
      result.message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");

    result.success = true;
    await poolClient.release();
    res.result = result;
    res.send(result);
  } catch (e) {
    await poolClient.query("ROLLBACK");
    await poolClient.release();
    return next(e);
  }
});

module.exports = router;
