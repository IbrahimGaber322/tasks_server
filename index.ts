import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);


const SERVER_PORT = process.env.SERVER_PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "";

app.use(cors());

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Routes
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

// Start the server
mongoose
  .connect(DATABASE_URL, { dbName: "tasks" })
  .then(() => {
    server.listen(SERVER_PORT, () => {
      console.log(`Server listening on port ${SERVER_PORT}`);
    });
  })
  .catch((err) => console.log(err));


//start command: ts-node-esm index.ts 