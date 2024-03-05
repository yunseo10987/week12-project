const { Client } = require("pg")
const router = require("express").Router()

router.get("/", async (req, res) =>{
    const { phoneNumber, email } = req.query
    const sql = "SELECT id FROM account WHERE email =? AND phone_number =?"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }

    const client = new Client({
        "user": "ubuntu",
        "password": "1234",
        "host": "localhost",
        "database": "web",
        "port": 5432
    })

    try{
        const {id} = req.body
        //db 연동
        await client.connect()
        const sql = "SELECT * FROM backend.account WHERE id=$1"
        const data = await client.query(sql, [id])
        //물음표 대신 $1  ?가 여러개면 $2 $3
        const row = data.rows

        if(row.length == 0){
            throw  new Error("회원 정보가 존재하지 않아용")
        }
        
        result.success = true
        result.data = row

    }catch(e){
        result.message = e.message
    }finally{
        if(client){
            client.end() //무조건 꺼줘야함
        }
        res.send(result)
    }
})

module.exports = router;