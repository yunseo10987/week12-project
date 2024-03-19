const express = require("express");
const router = express.Router();
const validator = require("../utils/validator");
const pool = require("../../database/connect/postgresql");

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

//댓글 쓰기
router.post("/", async (req, res) => {
  const sql =
    "INSERT INTO backend.comment(content, post_idx, account_idx) VALUES($1, $2, $3)";
  const { content, postIdx } = req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    validator.session(req.session.idx);
    validator.comment(content);

    await pool.query(sql, [content, postIdx, req.session.idx]);
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//댓글 읽기
router.get("/", async (req, res) => {
  //path parameter는 앞의 이름의 idx가 일반적, body로 받아야함
  //const sql = "SELECT comment.content, comment.date, account.nickname, comment.account_idx, comment.idx FROM comment,account WHERE comment.post_idx = ? AND comment.account_idx = account.idx ORDER BY comment.idx"
  const sql = `SELECT C.idx, C.content, C.created_at, C.account_idx, C.comment_likes, A.nickname 
        FROM backend.comment C JOIN backend.account A ON C.account_idx = A.idx 
        WHERE C.post_idx = $1 ORDER BY C.idx LIMIT 5 OFFSET($2 -1) * 5`;
  const { postIdx, pageNumber } = req.body;
  const result = {
    success: false,
    message: "",
    data: "",
  };
  try {
    const comment = await pool.query(sql, [postIdx, pageNumber]);
    result.success = true;
    result.data = comment.rows;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//댓글 수정
router.put("/:commentIdx", async (req, res) => {
  const sql =
    "UPDATE backend.comment SET content=$1 WHERE idx = $2 AND account_idx =$3";
  const { commentIdx } = req.params;
  const { content } = req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    validator.session(req.session.idx);
    validator.comment(content);

    await query(sql, [content, commentIdx, req.session.idx]);
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//댓글 삭제
router.delete("/:commentIdx", async (req, res) => {
  const sql = "DELETE FROM backend.comment WHERE idx = $1 AND account_idx =$2";
  const { commentIdx } = req.params;
  const result = {
    success: false,
    message: "",
  };
  try {
    validator.session(req.session.idx);

    const comment = await query(sql, [commentIdx, req.session.idx]);
    result.success = true;
  } catch (e) {
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

//댓글 좋아요
router.put("/commentIdx/likes", async (req, res) => {
  const { commentIdx } = req.params;
  const result = {
    success: false,
    message: "",
  };
  const poolClient = pool.connect();
  try {
    validator.session(req.session.idx);

    await poolClient.query("BEGIN");
    const isLikers = await poolClient.query(
      "SELECT idx FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2",
      [commentIdx, req.session.idx]
    );
    if (isLikers.rows) {
      await poolClient.query(
        "DELETE FROM backend.comment_likes WHERE comment_idx = $1 AND account_idx = $2",
        [commentIdx, req.session.idx]
      );
      await poolClient.query(
        "UPDATE backend.comment SET comment_likes = comment_likes - 1 WHERE idx = $1 AND account_idx = $2"
      );

      result.message = "좋아요 취소";
    } else {
      await poolClient.query(
        "INSERT INTO backend.comment_likes(comment_idx, account_idx) VALUES($1, $2)",
        [commentIdx, req.session.idx]
      );
      await poolClient.query(
        "UPDATE backend.comment SET comment_likes = comment_likes + 1 WHERE idx = $1 AND account_idx = $2"
      );

      result.message = "좋아요 추가";
    }
    await poolClient.query("COMMIT");
    result.success = true;
  } catch (e) {
    await poolClient.query("ROLLBACK");
    result.message = e.message;
  } finally {
    (await poolClient).release();
    res.send(result);
  }
});

module.exports = router;
