const { Client } = require("pg")

const client = new Client({
    "user": "ubuntu",
    "password": "1234",
    "host": "localhost",
    "database": "web",
    "port": 5432
})

module.exports = client