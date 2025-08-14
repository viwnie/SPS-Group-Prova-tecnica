import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { initializeAdmin } from './config/init.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use((req, res) => res.status(404).json({ message: 'Página não encontrada' }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await initializeAdmin();
  console.log(`Server is running on port ${PORT}`);
});