const client = require("../../database/connect/postgresql");

const checkDuplicatedId = async (req, res, next) => {
  const { id } = req.body;
  const result = {
    success: false,
    message: "",
  };
  try {
    const account = await client.query(
      `SELECT id FROM backend.account WHERE id =$1`,
      [id]
    );
    console.log(account.rows);

    if (account.rows.length) {
      throw new Error("이미 있는 아이디입니다.");
    }
    next();
  } catch (e) {
    result.message = e.message;
    res.send(result);
  }
};

module.exports = checkDuplicatedId;
