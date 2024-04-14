const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { S3Client } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();

const upload = multer({
  storage: multerS3({
    s3: new S3Client({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      region: "ap-northeast-2",
    }),
    bucket: process.env.BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `${uuid}_${file.originalname}`);
    },
    limits: { filesize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
      const fileType = file.mimetype.split("/")[1];
      if (fileType === "jpg" || fileType === "png" || fileType === "jpeg") {
        cb(null, true);
      } else {
        const error = new Error();
        error.message = "파일 확장자를 확인하세요.";
        error.status = 400;
        cb();
      }
    },
  }),
});

module.exports = upload;
