import dotenv from "dotenv";
import User from "../models/user";
import TempUser from "../models/tempUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Load environment variables from .env file
dotenv.config();

// Fetch environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const JWT_SECRET: string = process.env.JWT_SECRET || "test";
const FRONTEND_URL = process.env.FRONTEND_URL;

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});
/**
 * Sign up a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const signUp = async (req: any, res: any) => {
  const user = req.body;
  try {
    // Check if the user's email already exists
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      return res.status(400).json({ message: "This email is already used." });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(user.password, 12);

    // Create a new TempUser instance for email confirmation
    const newTempUser = new TempUser({ ...user, password: hashedPassword });
    await newTempUser.save();

    const { name, email, _id } = newTempUser;

    // Generate a JWT token for email confirmation
    const token = jwt.sign({ _id: _id }, JWT_SECRET, {
      expiresIn: "5min",
    });

    // Send an email with confirmation link
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Confirm your account",
      html: `<p>Hi ${name},</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${FRONTEND_URL}/confirm/${token}">Confirm your account</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Respond with confirmation message
    res.status(200).json({ message: "Need confirmation" });
  } catch (error) {
    res.status(500).json({ message: "Database error" });
  }
};

/**
 * Confirm a user's account using the provided token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const confirm = async (req: any, res: any) => {
  const { token } = req.params;
  try {
    // Verify the token and extract the user ID
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const _id = decodedToken._id;

    // Update the TempUser as confirmed and retrieve its data
    const tempUser = await TempUser.findOneAndUpdate(
      { _id: _id },
      { confirmed: true },
      { new: true }
    );

    // Create a new User instance based on the confirmed TempUser
    const newUser = new User({
      _id: tempUser._id,
      name: tempUser.name,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      password: tempUser.password,
      email: tempUser.email,
      confirmed: tempUser.confirmed,
    });

    // Save the new User instance
    await newUser.save();

    if (newUser) {
      const { name, email, firstName, lastName, confirmed } = newUser;

      // Generate a new token for the confirmed user
      const newToken = jwt.sign({ email: email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Respond with user information and token
      res.status(200).json({
        token: newToken,
        name,
        email,
        firstName,
        lastName,
        confirmed,
      });
    } else {
      res.status(404).json("No account found");
    }
  } catch (error) {
    res.status(500).json("Database error");
  }
};

/**
 * Sign in a user with provided credentials.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const signIn = async (req: any, res: any) => {
  const user = req.body;

  try {
    // Check if the user exists in User collection
    const foundUser = await User.findOne({ email: user.email });

    if (!foundUser) {
      // If not found in User collection, check in TempUser collection
      const tempUser = await TempUser.findOne({ email: user.email });

      if (tempUser) {
        const { name, email, _id, confirmed, firstName, lastName } = tempUser;

        // Validate the provided password
        const passwordValidate = await bcrypt.compare(
          user.password,
          tempUser.password
        );
        if (!passwordValidate) {
          return res.status(400).json({ message: "Password is incorrect." });
        } else {
          // Generate a verification token for confirmation link
          const verificationToken = jwt.sign({ _id: _id }, JWT_SECRET, {
            expiresIn: "5min",
          });

          // Generate a JWT token for the user
          const token = jwt.sign({ email: email }, JWT_SECRET, {
            expiresIn: "24h",
          });

          // Send an email with the confirmation link
          const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: "Confirm your account",
            html: `<p>Hi ${name},</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${FRONTEND_URL}/confirmEmail/${verificationToken}">Confirm your account</a>`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          // Respond with user information and tokens
          res.status(200).json({
            confirmed,
            token,
            email,
            name,
            firstName,
            lastName,
          });
        }
      } else {
        // User doesn't exist in both User and TempUser collections
        res.status(404).json({ message: "User doesn't exist." });
      }
    } else {
      // User found in User collection
      const { name, email, confirmed, firstName, lastName } = foundUser;

      // Validate the provided password
      const passwordValidate = await bcrypt.compare(
        user.password,
        foundUser.password
      );
      if (!passwordValidate) {
        return res.status(400).json({ message: "Password is incorrect." });
      }

      // Generate a JWT token for the user
      const token = jwt.sign({ email: email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Respond with user information and token
      res
        .status(200)
        .json({ token, name, email, confirmed, firstName, lastName });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Database error");
  }
};

/**
 * Send a password reset email to the user's email.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const forget = async (req: any, res: any) => {
  const { userEmail } = req.body;

  try {
    // Check if user exists with the provided email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(400).json({ message: "No user with this email" });
    }

    const { name, email, _id } = user;

    // Generate a token for password reset link
    const token = jwt.sign({ _id: _id }, JWT_SECRET, { expiresIn: "5min" });

    // Send an email with the password reset link
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Hi ${name}, Please click on the link below to reset your password:</p><a href="${FRONTEND_URL}/reset/${token}">Reset your password</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Respond with success message
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json("Database error");
  }
};

/**
 * Reset user's password using the provided token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const reset = async (req: any, res: any) => {
  const { password, token } = req.body;

  try {
    // Verify the token and extract user's ID
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const _id = decodedToken._id;

    // Find the user by ID
    const user = await User.findById(_id);

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(_id, { password: hashedPassword });

    // Respond with success message
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json("Database error");
  }
};

/**
 * Send a confirmation email to the user's email for account activation.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const sendConfirm = async (req: any, res: any) => {
  const { token } = req.body;

  try {
    // Verify the token and extract the user's email
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const email = decodedToken.email;

    // Find the user by email
    const existingUser = await TempUser.findOne({ email: email });

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "No user found with this email." });
    }

    if (existingUser.confirmed) {
      return res
        .status(400)
        .json({ message: "User account is already active." });
    }

    // Generate a confirmation token for activation link
    const confirmToken = jwt.sign({ email: existingUser.email }, JWT_SECRET, {
      expiresIn: "5min",
    });

    // Compose and send the confirmation email
    const mailOptions = {
      from: EMAIL_USER,
      to: existingUser.email,
      subject: "Confirm your account",
      html: `<p>Hi ${existingUser.name},</p><p>Thank you for signing up to our service. Please click on the link below to confirm your account:</p><a href="${FRONTEND_URL}confirm/${confirmToken}">Confirm your account</a>`,
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
