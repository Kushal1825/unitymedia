
import { Resend } from 'resend';
import verificationEmail from '../../emails/verificationemail.js'
import passwordVerification from '../../emails/passwordVerification.js'


export async function sendVerificationEmail(email,username,verifyCode) {
  try {

    const resend =  new Resend(`${process.env.RESEND_API_KEY}`)

    const { data, error } = await resend.emails.send({
      from: 'unity@unitymedia.fun',
      to: email,
      subject: 'Unity Message | verification Code',
      html: verificationEmail(username,verifyCode),
    });

    

    if(!data){
      return {
        success:false,
        message:error.message
      }
    }

    // console.log(data,error)    

    return {
      success:true,
      message:"Verification email send successfully"
    }
    
  } catch (emailError) {
    console.log("Error sending verification email",emailError);
    return {
      success:false,
      message:"Failed to send Verification Email"
    }
  }
}

export async function resetPasswordVerificationEmail(username,email,verifyCode) {
  try {

    const resend =  new Resend(`${process.env.RESEND_API_KEY}`)

    const { data, error } = await resend.emails.send({
      from: 'unity@unitymedia.fun',
      to: email,
      subject: 'Unity Message | Reset Verification Code',
      html: passwordVerification(username,verifyCode),
    });

    

    if(!data){
      return {
        success:false,
        message:error.message
      }
    }

    // console.log(data,error)    

    return {
      success:true,
      message:"Reset Password Otp send successfully"
    }
    
  } catch (emailError) {
    console.log("Error sending verification email",emailError);
    return {
      success:false,
      message:"Failed to send Verification code"
    }
  }
}
