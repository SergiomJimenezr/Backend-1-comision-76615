import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { ensureDataFiles } from './utils/ensureDataFiles.js';
import { ProductManager } from './storage/ProductManager.js';
import { resolvePath } from './utils/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await ensureDataFiles();

// Router de vistas
app.use('/', viewsRouter);

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Middleware de error
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', error: 'Internal Server Error' });
});

// Configurar Socket.io
const productsPath = resolvePath('data/products.json');
const pm = new ProductManager(productsPath);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Manejar creación de producto
  socket.on('createProduct', async (productData) => {
    try {
      const newProduct = await pm.add(productData);
      const products = await pm.getAll();
      io.emit('productsUpdated', products);
    } catch (err) {
      console.error('Error al crear producto:', err);
      socket.emit('error', { message: 'Error al crear producto' });
    }
  });

  // Manejar eliminación de producto
  socket.on('deleteProduct', async (productId) => {
    try {
      const deleted = await pm.deleteById(productId);
      if (deleted) {
        const products = await pm.getAll();
        io.emit('productsUpdated', products);
      } else {
        socket.emit('error', { message: 'Producto no encontrado' });
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      socket.emit('error', { message: 'Error al eliminar producto' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Exportar io para usarlo en el router de productos
app.set('io', io);

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`\nServidor listo en http://localhost:${PORT}`);
});