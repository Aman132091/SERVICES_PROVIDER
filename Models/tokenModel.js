const mongoose = require('mongoose')
const tokenSchema = new mongoose.Schema({
    token:{
        type:String,
    },
    email:{
        type:String,
    }
})

const tokenModel = mongoose.model('User_TOKEN',tokenSchema)
module.exports = tokenModel