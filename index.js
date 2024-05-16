import express from 'express';
import { PORT } from './config.js'; 
import indexRoutes from './routes/index.routes.js';
import usersRoutes from './routes/users.routes.js';
const app = express();
app.use(indexRoutes);
app.use(usersRoutes);
app.listen(PORT);
console.log('Server')