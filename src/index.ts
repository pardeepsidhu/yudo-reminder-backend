import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./models"
import { sequelize } from "./config/db";
import userRoutes from "./routes/user.route";
import emailRouter from "./routes/email.route"
import notificationRoute from "./routes/notification.route"
import taskRoute from "./routes/task.route"
import { swaggerUi, swaggerDocument } from "./docs/swagger";
import { pollUpdates } from "./controllers/telegram.controller"
import AIRoute from "./routes/ai.route"
import auth from "./middleware/authentication"
import RoutineRoute from "./routes/routine.route"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());




app.get('/', auth, (req, res) => res.send({ success: true }))
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/email", emailRouter)
app.use("/api/v1/notification", notificationRoute)
app.use("/api/v1/task", taskRoute)
app.use("/api/v1/ai", AIRoute)
app.use("/api/v1/routine", RoutineRoute)

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

    // await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server error:", error);
  }
};

startServer();