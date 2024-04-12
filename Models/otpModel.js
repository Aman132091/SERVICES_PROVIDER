const mongoose = require('mongoose')
const otpSchema = new mongoose.Schema({
    
    userID:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date

})
const otpModel = mongoose.model('OTP',otpSchema)
module.exports = otpModel