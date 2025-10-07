import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { connectDB, sequelize } from './config/db.js';
import {router} from './routes/taskRoutes.js';

config();
connectDB();

const app = express();
app.use(cors());
app.use(json());

app.use('/tasks', router);

sequelize.sync().then(() => {
    console.log('Database synced');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;