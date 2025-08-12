import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './controllers/authController.js';
import userRoutes from './controllers/usersController.js';
import { authenticate } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

app.use('/users', authenticate, userRoutes);

app.use((req, res) => res.status(404).json({ message: 'Pagina não encontrada' }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));