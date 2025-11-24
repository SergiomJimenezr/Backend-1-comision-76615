import { Router } from 'express';
import { ProductManager } from '../storage/ProductManager.js';
import { resolvePath } from '../utils/paths.js';

const router = Router();
const productsPath = resolvePath('data/products.json');
const pm = new ProductManager(productsPath);

// GET / - Vista home
router.get('/', async (_req, res, next) => {
  try {
    const products = await pm.getAll();
    res.render('home', {
      title: 'Productos - Home',
      products
    });
  } catch (err) {
    next(err);
  }
});

// GET /realtimeproducts - Vista de productos en tiempo real
router.get('/realtimeproducts', async (_req, res, next) => {
  try {
    const products = await pm.getAll();
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      products
    });
  } catch (err) {
    next(err);
  }
});

export default router;

