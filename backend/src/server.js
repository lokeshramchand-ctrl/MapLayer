import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => res.send('✅ Node + MySQL backend is running!'));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
