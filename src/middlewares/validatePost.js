const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  try {
    if (title === null || title === undefined || title === "") {
      throw new Error("제목을 입력하세요.");
    }
    if (content === null || content === undefined || content === "") {
      throw new Error("내용을 입력하세요.");
    }

    if (title.length < 1 || title.length > 30) {
      throw new Error("제목은 30자 이내로 작성하세요");
    }
    if (content.length < 1 || content.length > 1500) {
      throw new Error("내용은 1500자 이내로 작성하세요");
    }
    next();
  } catch (e) {
    e.api = "middlewares";
    next(e);
  }
};

module.exports = validatePost;
