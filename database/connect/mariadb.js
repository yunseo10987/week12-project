const mariadb = require("mysql");

const conn = mariadb.createConnection({
  host: "localhost",
  port: 3306,
  user: "stageus",
  password: "1234",
  database: "web",
});

module.exports = conn;
