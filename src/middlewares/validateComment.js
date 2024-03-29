const validateComment = (req, res, next) => {
  const { content } = req.body;
  try {
    if (content === null || content === undefined || content === "") {
      throw new Error("내용을 입력하세요.");
    }

    if (content.length < 1 || content.length > 1500) {
      throw new Error("내용은 1500자 이내로 작성하세요");
    }
  } catch (e) {
    e.api = "middlewares";
    next(e);
  }
};

module.exports = validateComment;
