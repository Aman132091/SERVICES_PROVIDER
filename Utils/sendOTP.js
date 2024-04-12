require("dotenv").config()
const twilio = require("twilio")

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const sendOTP = async (phoneNumber, otp) => {
    try {
      await twilioClient.messages.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Your OTP for sign-up is: ${otp}`
      })
      return ('OTP sent successfully',{otp})
    } catch (error) {
      console.error('Error sending OTP:', error)
      throw new Error('Error sending OTP')
    }
  }

module.exports = sendOTP  