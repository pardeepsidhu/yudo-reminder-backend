import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {sequelize} from "./config/db";
import userRoutes from "./routes/user.route";
import emailRouter from "./routes/email.route"
import notificationRoute from "./routes/notification.route"
import taskRoute from "./routes/task.route"
import { swaggerUi, swaggerDocument } from "./docs/swagger";
import { pollUpdates } from "./controllers/telegram.controller"
import AIRoute from "./routes/ai.route"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/email",emailRouter)
app.use("/api/v1/notification",notificationRoute)
app.use("/api/v1/task",taskRoute)
app.use("/api/v1/ai",AIRoute)

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
     setInterval(pollUpdates,12000);
  } catch (error) {
    console.log("Server error:", error);
  }
};

startServer();