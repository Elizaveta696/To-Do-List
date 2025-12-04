import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import { connectDB, sequelize } from "./config/db.js";
import { router } from "./routes/taskRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { teamRouter   } from "./routes/teamRoutes.js";

config();
connectDB();

const app = express();
app.use(cors());
app.use(json());

app.use('/api/tasks', router);
app.use("/api/auth", authRouter);
app.use('/api', teamRouter);

sequelize.sync({ alter: true }).then(() => {
	console.log("Database synced");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
