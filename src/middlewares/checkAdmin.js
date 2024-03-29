const jwt = require("jsonwebtoken");
const pool = require("../../database/connect/postgresql");

const checkAdmin = async (req, res, next) => {
  const token = req.cookies.access_token;

  try {
    const loginUser = jwt.decode(token);
    const isAdmin = await pool.query(
      `SELECT idx FROM backend.admin WHERE account_idx = $1`,
      [loginUser.idx]
    );
    if (!isAdmin.rows.length) {
      throw new Error("권한이 없습니다.");
    }
    next();
  } catch (e) {
    e.api = "middlewares";
    next(e);
  }
};
module.exports = checkAdmin;
