const client = require("../../database/connect/postgresql");
const { BadRequestException } = require("../utils/Exception");

const checkDuplicatedId = async (req, res, next) => {
  const { id } = req.body;
  try {
    const account = await client.query(
      `SELECT id FROM backend.account WHERE id =$1`,
      [id]
    );

    if (account.rows.length) {
      throw new BadRequestException("아이디가 이미 있습니다.");
    }
    next();
  } catch (e) {
    e.api = "middlewares";
    next(e);
  }
};

module.exports = checkDuplicatedId;
