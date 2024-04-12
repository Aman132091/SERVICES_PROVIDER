require('dotenv').config('./.env')
const cors = require('cors')
const express = require('express')
const router = require('./Routes/userRoutes')
const DB = require('./DB/db')
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const app = express()



DB(DATABASE_URL)
app.use(cors())
app.use(express.json())


app.use('/api',router)


app.get('/',(req,res)=>{
    res.send({status:'connected'})
})


app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})