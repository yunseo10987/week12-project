const router = require("express").Router();
const client = require("mongodb").MongoClient;

router.post("/", async (req, res) => {
  const { author, message } = req.body;
  const result = {
    success: false,
    message: "",
  };

  let connect = null;
  try {
    if (author == "" || author == undefined || author == null) {
      throw new Error("작성자 값 주셈");
    }
    if (message == "" || message == undefined || message == null) {
      throw new Error("채팅 값 주셈");
    }

    connect = await client.connect("mongodb://localhost:27017");

    const object = {
      author: author,
      message: message,
    };
    await connect.db("backend").collection("chat").insertOne(object);
    result.success = true;
  } catch (e) {
    console.log(e);
    result.message = e.message;
  } finally {
    if (connect) connect.close();
    res.send(result);
  }
});

module.exports = router;
