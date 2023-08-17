import dotenv from 'dotenv';
dotenv.config();
import User from "../models/user";
import TempUser from "../models/tempUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const JWTSECRET:string = process.env.JWTSECRET || "test";
const FRONTEND_URL = process.env.FRONTEND_URL;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  }
});

export const signUp = async(req:any, res:any) => {
    console.log("hoooooooooooo");
    const user = req.body ;
    try {  
        const existingUser = await User.findOne({email:user.email});
        if (existingUser) return res.status(400).json({message:"This email is already used."});
        const hashedPassword = await bcrypt.hash(user.password, 12);
        if(user.google){
            const newUser = new User({...user, password:hashedPassword, confirmed:true});
            await newUser.save();
            const {name,email,picture,firstName,lastName} = newUser;
            const token = jwt.sign({email:email}, JWTSECRET, {expiresIn: "24h"});
            res.status(200).json({token,name,picture,email, firstName, lastName});
        }else{
        const newTempUser = new TempUser({...user, password:hashedPassword});
        await newTempUser.save();
        const {name,email,_id} = newTempUser;
        const token = jwt.sign({_id:_id}, JWTSECRET, {expiresIn: "5min"});
        
        const mailOptions = {
          from: EMAIL_USER,
          to: email,
          subject: 'Confirm your account',
          html: `<p>Hi ${name},</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${FRONTEND_URL}/confirm/${token}">Confirm your account</a>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        
        res.status(200).json({message: "need confirm"});
    }
    } catch (error) {
        res.status(500).json("database error");
    }
}

export const confirm = async(req:any, res:any) => {
    
  const {token} = req.params;
  try {
    const decodedToken:any = jwt.verify(token, JWTSECRET);
    const _id = decodedToken._id;
    const tempUser = await TempUser.findOneAndUpdate({_id:_id},{confirmed:true},{new:true});
    const newUser = new User({_id:tempUser._id, name:tempUser.name, firstName:tempUser.firstName, lastName:tempUser.lastName, password:tempUser.password, email:tempUser.email, picture:tempUser.picture, googleCred:tempUser.googleCred, confirmed:tempUser.confirmed});
    await newUser.save();
    if (newUser) {
      const {name,picture,email, firstName, lastName,friends,requests,cover,about} = newUser;
      const newToken = jwt.sign({email:email}, JWTSECRET, {expiresIn: "24h"});
      res.status(200).json({token:newToken,name,picture,email, firstName, lastName,friends,requests,cover,about});
    } else {
      res.status(404).json("no account");
    }
  } catch (error) {
    res.status(500).json("database error");
  }
}

export const signIn = async(req:any, res:any) => {
    
    const user = req.body ;
     console.log(user);
    try {
        const foundUser = await User.findOne({email:user.email});
        if(!foundUser){
            const tempUser = await TempUser.findOne({email:user.email});
            if(tempUser){
                const {name,email,_id,confirmed} = tempUser;
            const verificationToken = jwt.sign({_id:_id}, JWTSECRET, {expiresIn: "5min"});
            const token = jwt.sign({email:email}, JWTSECRET, {expiresIn: "24h"});
            const mailOptions = {
              from: EMAIL_USER,
              to: email,
              subject: 'Confirm your account',
              html: `<p>Hi ${name},</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${FRONTEND_URL}/confirmEmail/${verificationToken}">Confirm your account</a>`
            };
            
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
             res.status(200).json({confirmed:confirmed,token:token, email:email, name:name});
        }else{
            res.status(404).json({message: "User doesn't exist."});
        }
        }else{
            const {name,email,confirmed} = foundUser;
        
        const passwordValidate = await bcrypt.compare(user.password, foundUser.password);  
        if(!passwordValidate) return res.status(400).json({message: "Password is incorrect."});
        
        const token = jwt.sign({email:email}, JWTSECRET, {expiresIn: "24h"});
         
        res.status(200).json({token,name,email, confirmed:confirmed});
    }
    } catch (error) {
        console.log(error);
        res.status(500).json("database error");
    }

}


export const forget= async(req:any, res:any) => {
  
  const {userEmail} = req.body ;
  
  try {  
      const user = await User.findOne({email:userEmail});
      if (!user) return res.status(400).json({message:"no user with this email"});
      const {name,email,_id} = user;
      const token = jwt.sign({_id:_id}, JWTSECRET, {expiresIn: "5min"});
      
      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        html: `<p>Hi ${name}, Please click on the link below to reset your password:</p><a href="${FRONTEND_URL}/resetpassword/${token}">Reset your password</a>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
      res.status(200).json({message: "success"});
  
  } catch (error) {
      res.status(500).json("database error");
  }
}

export const reset = async(req:any, res:any) => {
  
const {password,token} = req.body;

try {
  const decodedToken:any = jwt.verify(token, JWTSECRET);
  const _id = decodedToken._id;
  const user = await User.findById(_id);
  
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(_id, {password:hashedPassword});
  res.status(200).json({message:"success"})
} catch (error) {
  res.status(500).json("database error");
}
}

export const sendConfirm = async (req:any, res:any) => {
  const { token } = req.body;
  console.log("heeeeeeeeeeeh");

  try {
    const decodedToken:any = jwt.verify(token, JWTSECRET);
    const email = decodedToken.email;
    const existingUser = await User.findOne({email:email});

    if (!existingUser)
      return res
        .status(400)
        .json({ message: "No user found with this email." });

   
    if (existingUser.confirmed)
      return res
        .status(400)
        .json({ message: "User account is already active." });

    const confirmToken = jwt.sign(
      { email: existingUser.email },
      JWTSECRET,
      { expiresIn: "5min" }
    );

    const mailOptions = {
      from: EMAIL_USER,
      to: existingUser.email,
      subject: "Confirm your account",
      html: `<p>Hi ${
        existingUser.name
      },</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${
        FRONTEND_URL
      }confirm/${confirmToken}">Confirm your account</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to send activation email." });
      } else {
        console.log("Email sent: " + info.response);
        res
          .status(200)
          .json({ message: "Activation email sent successfully." });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Database error." });
  }
};