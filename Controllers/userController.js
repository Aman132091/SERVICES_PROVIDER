const otpModel = require('../Models/otpModel')
const userModel = require('../Models/userModel')
const tokenModel = require('../Models/tokenModel')
const updateModel = require('../Models/updateDetails')
const categoryModel = require('../Models/catagoriesModel')
const multer = require('multer')
const upload = require('../Middlewares/multer')
const axios = require('axios');
const querystring = require('querystring');
const userMiddleware = require('../Middlewares/userMiddleware')
const nodemailer = require('nodemailer')
const transporter = require('../Config/emailconfig')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const path = require('path')
const sendOTP = require('../Utils/sendOTP')

    

//Send otp to email during signup
const sendOtp = async (email) => {

    try {

        const otp = Math.floor(1000 + Math.random() * 9000)

        const otpExpiration = new Date()
        otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000 )

        const saltotp = await bcryptjs.genSalt(10)
        const hashotp = await bcryptjs.hash(otp.toString(), saltotp)

        await userModel.findOneAndUpdate({ email }, { otp: hashotp, otpExpiration })

        const info = await transporter.sendMail({

            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'OTP to verify Email.....',
            text: `Your OTP is : ${otp}`

        });

        return { status: 'success', message: 'OTP sent successfully',info,data:{otp}}

    } catch (error) {

        throw new Error(error.message)

    }

}




//Register User

exports.signup = async (req, res) => {

    const { fullname, email, gender, phnum, password, confirmpassword } = req.body

    try {

        if (fullname && email && gender && password && confirmpassword) {

            const user = await userModel.findOne({ email })

            if (user) {

                return res.send({ status: 'failed', message: 'User Already Exists.....' })

            } 
            else {

                if (password === confirmpassword) {

                    const salt = await bcryptjs.genSalt(10)
                    const hashPassword = await bcryptjs.hash(password, salt)
                    let newUser

                    upload(req, res, async (err) => {

                        if (err instanceof multer.MulterError) {

                            return res.status(400).send({ status: 'failed', message: 'File upload error' })

                        }


                        if (req.file) {

                            newUser = new userModel({

                                fullname: fullname,
                                email: email,
                                phnum: phnum,
                                gender: gender,
                                password: hashPassword,
                                profileImage: req.file.filename 

                            })

                        } else {

                            newUser = new userModel({

                                fullname: fullname,
                                email: email,
                                phnum: phnum,
                                gender: gender,
                                password: hashPassword,

                            })

                        }

                        await newUser.save()

                        const otpResult = await sendOtp(email)


                        if (phnum) {

                            const otp = Math.floor(1000 + Math.random() * 9000)
                            await userModel.findOneAndUpdate({ phnum }, { $set: { otpPhone: otp } })
                            const otpphn = sendOTP(phnum, otp)

                            res.send({ status: 'success', message: 'OTP sent successfully .....',...otpResult, 'otpPhn':{otp} })

                        } else {

                            res.send({ status: 'failed', message: 'otp sent successfully.....', ...otpResult })

                        }

                    })

                } 
                else {

                    res.send({ status: 'failed', message: 'Password & Confirm password do not match.....' })

                }

            }

        }
         else {

            res.send({ status: 'failed', message: 'All fields are required.....' })

        }

    } 

    catch (error) {

        res.send({ status: 'failed', message: error.message })

    }

}




// //verifyotp for signup email during signup
exports.verifyOTPforEmail = async (req, res) => {

    try {

        const { email,otp } = req.body
        const user = await userModel.findOne({email})
        
        if (user) {

            if (!user.otp || user.otpExpiration < Date.now()) {

                res.send({ message: 'OTP expired or not valid' })

            } else {

                const matchOtp = await bcryptjs.compare(otp.toString(), user.otp)

                if (matchOtp) {

                    if(user.tempEmail ){

                        user.email = user.tempEmail
                        user.tempEmail = undefined
                        user.otp = undefined
                        user.otpExpiration = undefined

                    }else{

                        user.otp = undefined
                        user.otpExpiration = undefined

                    }


                    await user.save()

                    const token = jwt.sign({ userID: user._id }, process.env.SECRET_KEY, { expiresIn: '5d' });

                    const newToken = tokenModel({

                        token: token,
                        email: user.email,

                    });

                    await newToken.save();

                    res.send({message:'Successfully signup',token})

                }else{
                    // await userModel.findByIdAndDelete(req.user)
                    res.send({message:'otp not matched'})

                }
            }

        } else {

            res.send({ message: 'User not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

}



//verify otp for phone during signup
exports.verifyOTPforPhone = async (req, res) => {

    try {

        const { otp } = req.body
        const user = await userModel.findById(req.user)
        
        
        if (user) {

            if (!user.otpPhone || user.otpExpiration < Date.now()) {

                res.send({ message: 'OTP expired or not valid' })

            } else {

                console.log('rr')

                if (otp === user.otpPhone) {

                    if(user.tempPh){

                        user.phnum = user.tempPh
                        user.tempPh = undefined
                        user.otpPhone = undefined
                        user.otpExpiration = undefined

                    }else{

                        user.otpPhone = undefined
                        user.otpExpiration = undefined

                    }

                    await user.save()
                    res.send({ message: 'OTP VERIFIED' })

                } else {

                    res.send({ message: 'OTP does not match' })

                }

            }
        } else {

            res.send({ message: 'User not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

};



// Resend OTP API
exports.resendOTP = async (req, res) => {

    try {

      const { email } = req.body
  
      if (!email) {

        return res.send({ status: 'failed', message: 'Email is required' })

      }
  
      const user = await userModel.findOne({email})
  
      if (!user) {

        return res.send({ status: 'failed', message: 'User not found' })

      }
  
      const otpResult = await sendOtp(user.email)
  
      res.send({ status: 'success', message: 'OTP sent to email', ...otpResult })

    } catch (error) {

      res.send({ status: 'failed', message: error.message })

    }

}



// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {

    try {

        const user = await userModel.findById(req.user)

      if (!user) {

        return res.status(404).send({ status: 'failed', message: 'User not found' })

      }
  
      upload(req, res, async (err) => {

        if (err instanceof multer.MulterError) {

          return res.status(400).send({ status: 'failed', message: 'File upload error' })

        }
  
        if (!req.file) {

          return res.status(400).send({ status: 'failed', message: 'No file uploaded' })

        }
  
        user.profileImage = req.file.filename

        await user.save()
  
        res.send({ status: 'success', message: 'Profile image updated successfully', filename: req.file.filename })

      })

    } catch (error) {

      res.status(500).send({ status: 'failed', message: error.message })

    }

};




//signin user
exports.signin = async(req,res)=>{

    const {email,password} = req.body
    // const user = await userModel.findOne({ $or: [{ email }, { tempEmail:email }]})
    const user = await userModel.findById(req.user)

    try {

        if(user){

            if(email && password){
    
                const isValid = await bcryptjs.compare(password,user.password)
    
                if((user.email === email ) && isValid){

                    const token = jwt.sign({userID:user._id},process.env.SECRET_KEY,{expiresIn:'5d'})
                    res.send({status:'sucess',message:'Successfull signin.....',token})

                }else{

                    res.send({status:'failed',message:'Email or password not'})

                }
    
            }else{

                res.send({status:'failed',message:'All filed required.....'})

            }
        }else{

            res.send({status:'fdailed',message:'User not found.....'})

        }

    } catch (error) {

        res.send({message:error.message})

    }

}



//register user using google
exports.googleLogin = async(req , res)=>{

    try {

      const redirectURI = encodeURIComponent('http://localhost:7654/api/verifyGoogle')
      const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=email%20profile`
      res.send(authURL)
    
    } catch (error) {

      console.log("Error During Google Login")
      res.send("error")
  
    }

}


//verify user by google then register
exports.googleVerify = async (req, res) => {

    const code = req.query.code

    try {
     
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: 'http://localhost:7654/api/verifyGoogle',
        grant_type: 'authorization_code'

      }))

      
      const accessToken = tokenResponse.data.access_token
     
      // Fetch user details from Google using the access token
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {

        headers: {

          Authorization: `Bearer ${accessToken}`

        }

      });

      console.log(profileResponse.data)

      const userData = await userModel.create({

        googleId: profileResponse.data.id,
        fullname: profileResponse.data.name,
        email: profileResponse.data.email,
        profileImage: profileResponse.data.picture

    
      })

      res.status(200).json({message:'Sign-up successful!' ,  userData})

    } catch (error) {

      console.error("Error occurred during sign-up:")
      res.status(500).send('Error occurred during sign-up')

    }
    
}



//verify OTP for updated Email
exports.verifyOTPforUpdatedEmails = async (req, res) => {

    try {

        const { otp } = req.body
        const user = await userModel.findById(req.user)
        
        if (user) {

            if (!user.otp || user.otpExpiration < Date.now()) {

                res.send({ message: 'OTP expired or not valid' })

            } else {

                const matchOtp = await bcryptjs.compare(otp.toString(), user.otp)

                if (matchOtp) {
                    
                    user.otp = otp;
                    console.log(user.otp);
                    user.otpExpiration = Date.now() + 600000; 
                    user.email = user.tempEmail
                    user.tempEmail = undefined
                    user.otp = undefined
                    user.otpExpiration = undefined

                    await user.save()
                    res.send({ message: 'OTP VERIFIED' })

                } else {

                    res.send({ message: 'OTP does not match' })
                
                  }

            }
        } else {

            res.send({ message: 'User not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

}



//forget password
exports.forgetPassword = async(req,res)=>{

    const {newPassword} = req.body
    const user = await userModel.findById(req.user)

    try {

        if(user){

            if(newPassword){

                const saltFp = await bcryptjs.genSalt(10)
                const hashNewPassword = await bcryptjs.hash(newPassword,saltFp)
                user.tempPassword = hashNewPassword
    
    
                await user.save()
                const otpFP = await sendOtp(user.email)
    
                res.send({message:'otp send to upodate password',otpFP})
                
            }
            else{

                res.send({message:'nothing to update'})

            }

        }else{

            res.send({message:'user not found'})

        }
    } catch (error) {

        res.send({message:error.message})
        
    }

}



//verify otp for forget password
exports.verifyotpforFP = async(req,res)=>{

    const {otp} = req.body
    const user = await userModel.findById(req.user)

    if(user){

        if(otp){

            const matchPasswordforFp = await bcryptjs.compare(otp.toString(),user.otp)

            if(matchPasswordforFp){

                user.password = user.tempPassword
                user.otp = undefined
                user.tempPassword = undefined

                await user.save()

                res.send({message:'password updated successfully'})

            }else{

                res.send({message:'password not matched'})

            } 
        }else{

            res.send({message:'Plese provide a valid otp'})

        }
    }else{

        res.send({message:'User not found'})

    }

}



//updates details of user
exports.updateDetails = async (req, res) => {

    const { fullname, newEmail, gender,newPhnum } = req.body
    const user = await userModel.findById(req.user)

    try {

        console.log('1')

        if (user) {

            console.log('1')

            if (newEmail && newEmail !== user.email) {

                const existingUpdate = await updateModel.findOne({ newEmail })

                if (existingUpdate) {

                    return res.send({ status: 'failed', message: 'Email update request already exists' })

                }

                const otpResult = await sendOtp(user.email)
                console.log(otpResult)
                
                // if (!user.otp || user.otpExpiration < Date.now()) {
                //     return res.send({ status: 'failed', message: 'Email updated now verify the otp for new email', ...otpResult })
                // }
                user.tempEmail = newEmail
                await user.save()

                return res.send({ status: 'success', message: 'OTP sent to your email please verify otp to update' , otpResult})

            }
            if (newPhnum && newPhnum !== user.phnum) {

                const existingUpdatephn = await updateModel.findOne({ newPhnum })

                if (existingUpdatephn) {

                    return res.send({ status: 'failed', message: 'Phone number update request already exists' })
                
                }

                if(newPhnum){

                const otp = Math.floor(1000 + Math.random() * 9000);
                const otpExpiration = new Date()
                otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000 )
                // await userModel.findOneAndUpdate({ phnum:user.phnum }, { $set: { otpPhone: otp } })
                const otpphn =await sendOTP(user.phnum,otp)
                user.tempPh = newPhnum
                user.otpPhone = otp

                await user.save()
                
                return res.send({message:'otp send to mobile numvber',...otpphn,'otp':{otp}})
               
                }

    
            }else{

                res.send({message:'provide a different phone number'})

            }

            if (fullname) {

                user.fullname = fullname

            }

            if (gender) {

                user.gender = gender

            }

            await user.save()
            return res.send({ status: 'success', message: 'Details updated successfully' })

        } else {

            return res.send({ status: 'failed', message: 'User not found' })

        }
    } catch (error) {

        return res.status(500).send({ status: 'failed', message: error.message })

    }

}



// //update profile picture
// exports.updatePicture = async(req,res)=>{
//     const newprofileImage = req.file
//     const user = await userModel.findById(req.user)
//     try {
//         if(user){
//             if(newprofileImage){
//                 await userModel.updateOne({email:user.email},{$set:{profileImage:newprofileImage}})
//                 console.log(user.profileImage,newprofileImage);
//                 res.send({message:'updated successfully'})
//             }else{true
//                 res.send({message:'no new profile uploaded'})
//             }
//         }
//         else{
//             res.send({message:'user not found'})
//         }
//     } catch (error) {
//         res.send({message:error.message})
        
//     }

// }

//send request to ride share
exports.rshare = async (req, res) => {

    const { title, description, pickuplocation, wehreto, noofmales, nooffemales } = req.body

    try {

        const user = await userModel.findById(req.user)

        if (user) {
            // Find the Category document
            let category = await categoryModel.findOne()
            
            // If category doesn't exist, create a new one
            if (!category) {

                category = new categoryModel()

            }

            const fullname = user.fullname

            // Push the new rShare request into the existing array
            category.rShare.push({ title, description, pickuplocation, wehreto, noofmales, nooffemales,fullname})
            
            // Save the updated Category document
            await category.save()
            
            res.send({ status: 'added' })

        } else {

            res.send({ status: 'user not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

}


//send request to package transport
exports.pTransport = async (req, res) => {

    const { title, description, pickuplocation, transportto, noofitems, totalweight } = req.body

    try {

        const user = await userModel.findById(req.user)

        if (user) {
            // Find the Category document
            const category = await categoryModel.findOne()
            
            // If category doesn't exist, create a new one
            if (!category) {

                category = new categoryModel()

            }

            const fullname = user.fullname

            // Push the new rShare request into the existing array
            category.pTransport.push({ title, description, pickuplocation, transportto, noofitems, totalweight, fullname })
            
            // Save the updated Category document
            await category.save()
            
            res.send({ status: 'added' })

        } else {

            res.send({ status: 'user not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }
}



//send request to G finder
exports.gFinder = async (req, res) => {

    const { title, description, location } = req.body

    try {

        const user = await userModel.findById(req.user)

        if (user) {

            // Find the Category document
            const category = await categoryModel.findOne()
            
            // If category doesn't exist, create a new one
            if (!category) {

                category = new categoryModel()

            }

            const fullname = user.fullname

            // Push the new rShare request into the existing array
            category.gFinder.push({ title, description, location, fullname})
            
            // Save the updated Category document
            await category.save()
            
            res.send({ status: 'added' })

        } else {

            res.send({ status: 'user not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

}



//send request to Advice/Information
exports.aInformation = async (req, res) => {

    const { title, description } = req.body

    try {

        const user = await userModel.findById(req.user)

        if (user) {
            // Find the Category document
            const category = await categoryModel.findOne()
            
            // If category doesn't exist, create a new one
            if (!category) {

                category = new categoryModel()

            }

            const fullname = user.fullname

            // Push the new rShare request into the existing array
            category.aInformation.push({ title, description, fullname })
            
            // Save the updated Category document
            await category.save()
            
            res.send({ status: 'added' })

        } else {

            res.send({ status: 'user not found' })

        }
    } catch (error) {

        res.send({ message: error.message })

    }

}



//Get Details of all requests
exports.getDetails = async(req,res)=>{

    try {

        const category = await categoryModel.findOne()

        if(!category){

            res.send({message:'category not found'})

        }

        const rShareDetails = category.rShare
        const pTransportDetails = category.pTransport
        const gFinderDetails = category.gFinder
        const aInformationDetails = category.aInformation

        const details = {

            rShare:rShareDetails,
            pTransport:pTransportDetails,
            gFinder:gFinderDetails,
            aInformation:aInformationDetails

        }

        res.send(details)

    } catch (error) {

        res.send({message:error.message})
        
    }

}



//Search each category requests
exports.searchCategory = async(req,res)=>{

    const {category} = req.query

    try {

        const categoryDoc = await categoryModel.findOne()
        
        if(!categoryDoc){

            res.send({message:'Category not found'})

        }

        let categoryRequests

        switch (category) {

            case 'rShare':

                categoryRequests = categoryDoc.rShare
                
                break;

            case 'pTransport':

                categoryRequests = categoryDoc.pTransport

                break;

            case  'gFinder':

                categoryRequests = categoryDoc.gFinder

                break

            case 'aInformation':

                categoryRequests = categoryDoc.aInformation

                break

            default:

                res.send({message:'invalid category'})

        }

        res.send(categoryRequests)

    } catch (error) {

        res.send({message:error.message})
        
    }

}

