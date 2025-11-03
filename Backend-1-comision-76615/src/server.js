import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import { ensureDataFiles } from './utils/ensureDataFiles.js';


const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await ensureDataFiles();

app.get('/', (_req, res) => {
res.json({ status: 'ok', message: 'API Backend M1 — Entrega 1', routes: ['/api/products', '/api/carts'] });
});


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use((err, _req, res, _next) => {
console.error('Unhandled error:', err);
res.status(500).json({ status: 'error', error: 'Internal Server Error' });
});


app.listen(PORT, () => {
console.log(`\nServidor listo en http://localhost:${PORT}`);
});