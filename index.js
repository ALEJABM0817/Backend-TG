import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { PORT } from './config.js'; 
import indexRoutes from './routes/index.routes.js';
import usersRoutes from './routes/users.routes.js';
import imagesRoutes from './helpers/saveImages.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(indexRoutes);
app.use(usersRoutes);
app.use(imagesRoutes);

// Servir los archivos estáticos del directorio public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta comodín para manejar rutas del lado del cliente
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});