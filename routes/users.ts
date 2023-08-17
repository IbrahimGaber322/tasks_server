import express from "express";
import { signUp, signIn,  confirm, forget, reset , sendConfirm } from "../controllers/users";

const router = express.Router();


router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/confirm/:token', confirm);
router.post('/forget', forget);
router.post('/reset', reset);
router.post("/send-confirm", sendConfirm);


export default router;

