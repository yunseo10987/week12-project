const { Pool } = require("pg");

const pool = new Pool({
  user: "ubuntu",
  password: "1234",
  host: "localhost",
  database: "web",
  port: 5432,
  max: 10,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

module.exports = pool;
