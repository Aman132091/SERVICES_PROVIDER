const express = require('express')
const { signup, signin, updateDetails, rshare, pTransport, gFinder, aInformation, getDetails, searchCategory, verifyOTPforPhone, verifyOTPforUpdatedEmails, googleLogin, googleVerify, updatePicture, forgetPassword, verifyotpforFP, verifyOTPforEmail, uploadImage, resendOTP, uploadProfileImage } = require('../Controllers/userController')
const {checkAuth} = require('../Middlewares/userMiddleware')
const uploads = require('../Middlewares/multer')
// const uploads = createMiddleware(
//     [
//       { name: "profileImage" },
//     ]
//   );
const router = express.Router()



router.post('/register',uploads,signup)
router.get('/loginGoogle',googleLogin)
router.get('/verifyGoogle',googleVerify)
// router.post('/register',signup)
router.post('/signin',checkAuth,signin)
router.post('/forgetpassword',checkAuth,forgetPassword)
router.post('/verifyotpforemail',verifyOTPforEmail)
router.post('/verifyotpforemails',checkAuth,verifyOTPforUpdatedEmails)
router.post('/verifyotp',checkAuth,verifyOTPforPhone)
router.post('/rshare',checkAuth,rshare)
router.post('/ptransport',checkAuth,pTransport)
router.post('/gfinder',checkAuth,gFinder)
router.post('/ainformation',checkAuth,aInformation)
router.post('/resendOTP',resendOTP)
router.put('/update',checkAuth,updateDetails)
// router.put('/updateprofileimage',checkAuth,updatePicture)
router.put('/verifyotpforfp',checkAuth,verifyotpforFP)
router.post('/uploadimage',checkAuth,uploads,uploadProfileImage)

router.get('/getdetails',getDetails)
router.get('/search',searchCategory)


module.exports = router