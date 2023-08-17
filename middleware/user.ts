import jwt from "jsonwebtoken";

const JWTSECRET = process.env.JWTSECRET || "test";
const user = (req: any, res: any, next: any): void => {
  try {
    const token: string | undefined = req?.headers?.authorization?.split(" ")[1];

    if (token) {
      jwt.verify(token, JWTSECRET, (err: any, decoded: any) => {
        if (err) {
            res.status(404).json({ message: "Unauthinticated" });
        } else {
          req.userEmail = decoded?.email;
          req.token = token;
          next();
        }
      });
    } else {
      res.json("Unauthenticated");
    }
  } catch (error) {
    console.log(error);
  }
}

export default user;