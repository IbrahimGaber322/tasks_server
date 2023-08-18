import express from "express"; // Import the Express framework
import {
  signUp,
  signIn,
  confirm,
  forget,
  reset,
  sendConfirm,
} from "../controllers/users"; // Import user-related controller functions

const router = express.Router(); // Create an instance of an Express Router

// Define routes and their corresponding controller functions

/**
 * Route: POST /sign-up
 * Description: Register a new user
 */
router.post("/sign-up", signUp);

/**
 * Route: POST /sign-in
 * Description: User login
 */
router.post("/sign-in", signIn);

/**
 * Route: GET /confirm/:token
 * Description: Confirm user's email with the provided token
 */
router.get("/confirm/:token", confirm);

/**
 * Route: POST /forget
 * Description: Initiate the process of password recovery
 */
router.post("/forget", forget);

/**
 * Route: POST /reset
 * Description: Reset user's password after recovery
 */
router.post("/reset", reset);

/**
 * Route: POST /send-confirm
 * Description: Send email confirmation link to the user
 */
router.post("/send-confirm", sendConfirm);

export default router; // Export the router for use in other parts of the application
