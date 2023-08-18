// Import required modules and packages
import dotenv from "dotenv"; // Load environment variables from .env file
import express from "express"; // Web framework for building APIs
import bodyParser from "body-parser"; // Parse incoming request bodies
import mongoose from "mongoose"; // MongoDB object modeling tool
import cors from "cors"; // Enable Cross-Origin Resource Sharing
import http from "http"; // HTTP module for creating server

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express app
const app = express();
const server = http.createServer(app);

// Define the port for the server to listen on
const SERVER_PORT = process.env.SERVER_PORT || 5000;

// Get the database connection URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || "";

// Enable CORS for handling cross-origin requests
app.use(cors());

// Parse incoming JSON requests with a limit of 30mb
app.use(bodyParser.json({ limit: "30mb" }));

// Parse incoming urlencoded requests with a limit of 30mb and extended mode
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Import and use route handlers for tasks and users
import userRoutes from "./routes/users"; // User-related routes
import taskRoutes from "./routes/tasks"; // Task-related routes
app.use("/tasks", taskRoutes); // Register task routes under "/tasks" endpoint
app.use("/users", userRoutes); // Register user routes under "/users" endpoint

// Establish a connection to the MongoDB database and start the server
mongoose
  .connect(DATABASE_URL, { dbName: "tasks" }) // Connect to the "tasks" database
  .then(() => {
    server.listen(SERVER_PORT, () => {
      console.log(`Server listening on port ${SERVER_PORT}`);
    });
  })
  .catch((err) => console.log(err));

// Command to start the application: ts-node-esm index.ts
