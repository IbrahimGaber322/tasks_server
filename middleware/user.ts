import jwt from "jsonwebtoken";

// Fetch the JWT secret key from environment variables or use a default value
const JWT_SECRET = process.env.JWT_SECRET || "test";

/**
 * Middleware to authenticate users using JWT.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const user = (req: any, res: any, next: any) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (token) {
      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          res.status(401).json({ message: "Unauthorized" });
        } else {
          req.userEmail = decoded?.email;
          req.token = token;
          next();
        }
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default user;
