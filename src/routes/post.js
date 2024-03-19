const express = require("express");
const router = express.Router();
const validator = require("../utils/validator");
const pool = require("../../database/connect/postgresql");
const notification = require("../mongooseSchema/notificationsSchema");

// const query = function (sql, params=[]){
//     return new Promise((resolve, reject) => {
//         mariadb.query(sql, params, (err, rows) => {
//             if(err){
//                 reject(err)
//             }else{
//                 resolve(rows)
//             }

//         })
//     })
// }

//게시글 전체 목록
router.get("/all", async (req, res) => {
  const sql = `SELECT P.idx, P.created_at, PC.name, P.title, P.idx 
        FROM backend.post P 
        LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx 
        ORDER BY P.idx DESC`;
  const result = {
    success: false,
    message: "",
  };
  try {
    const post = await pool.query(sql);
    result.data = post.rows;
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//게시글 쓰기
router.post("/", async (req, res) => {
  const { title, content, category } = req.body;
  const sql =
    "INSERT INTO backend.post(title, content, account_idx, post_category_idx) VALUES($1, $2, $3, $4) RETURNING idx";
  const sql2 = `SELECT A.nickname FROM backend.post P, backend.account A WHERE P.account_idx = A.idx AND P.idx = $1`;
  const result = {
    success: false,
    message: "",
  };

  try {
    validator.session(req.session.idx);
    validator.post({ title: title, content: content });

    const firstResult = await pool.query(sql, [
      title,
      content,
      req.session.idx,
      category,
    ]);
    const postIdx = firstResult.rows[0].idx;
    console.log(postIdx);
    const secondResult = await pool.query(sql2, [postIdx]);
    const nickname = secondResult.rows[0].nickname;
    console.log("되는 거임?");
    await notification.create({
      type: "global",
      writer: nickname,
      data: {
        postIdx: postIdx,
      },
    });
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//게시글 읽기
router.get("/:postIdx", async (req, res) => {
  const { postIdx } = req.params;
  const sql = `
        SELECT P.title, P.crerated_at,P.content,P.post_likes A.idx, A.nickname, PC.name
        FROM backend.post P 
        LEFT OUTER JOIN backend.account A ON P.account_idx = A.idx
        LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx
        WHERE P.idx = $1
        `;

  const result = {
    success: false,
    message: "",
  };
  try {
    const post = await pool.query(sql, [postIdx]);
    console.log(post);
    if (!post.rows.length) {
      throw new Error("해당 게시글이 없거나 삭제되었습니다");
    }
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//게시글 수정
router.put("/:postIdx", async (req, res) => {
  const { postIdx } = req.params;
  const sql =
    "UPDATE backend.post SET title=$1, content=$2,post_category_idx=$3 WHERE idx = $4 AND account_idx = $5";
  const { title, content, category } = req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    validator.session(req.session.idx);
    validator.post({ title: title, content: content });

    await pool.query(sql, [title, content, category, postIdx, req.session.idx]);

    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//게시글 삭제
router.delete("/:postIdx", async (req, res) => {
  const { postIdx } = req.params;
  const sql = "DELETE FROM backend.post WHERE idx = $1 AND account_idx = $2";
  const result = {
    success: false,
    message: "",
  };
  try {
    validator.session(req.session.idx);

    await pool.query(sql, [postIdx, req.session.idx]);
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//게시물 좋아요
router.put("/postIdx/likes", async (req, res) => {
  const { postIdx } = req.params;
  const result = {
    success: false,
    message: "",
  };
  const poolClient = await pool.connect();
  try {
    validator.session(req.session.idx);

    await poolClient.query("BEGIN");
    const selectPostLikeQueryResult = await poolClient.query(
      `SELECT idx FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2`,
      [postIdx, req.session.idx]
    );
    const postLikeState = selectPostLikeQueryResult.rows[0];

    if (postLikeState) {
      await poolClient.query(
        "DELETE FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2",
        [postIdx, req.session.idx]
      );
      await poolClient.query(
        "UPDATE backend.post SET post_likes = post_likes - 1 WHERE idx = $1",
        [postIdx]
      );
      await notification.create({
        type: "individual",
        writer: nickname,
        data: {
          postIdx: postIdx,
        },
      });
      result.message = "좋아요 취소";
    } else {
      await poolClient.query(
        "INSERT INTO backend.post_likes(post_idx, account_idx) VALUES($1, $2)",
        [postIdx, req.session.idx]
      );
      await poolClient.query(
        "UPDATE backend.post SET post_likes = post_likes + 1 WHERE idx = $1",
        [postIdx]
      );

      result.message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");
    result.success = true;
  } catch (e) {
    await poolClient.query("ROLLBACK");
    result.message = e.message;
  } finally {
    poolClient.release();
    res.send(result);
  }
});

module.exports = router;
