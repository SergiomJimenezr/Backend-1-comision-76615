import { Router } from 'express';
import { ProductManager } from '../storage/ProductManager.js';
import { CartManager } from '../storage/CartManager.js';

const router = Router();
const pm = new ProductManager();
const cm = new CartManager();

// GET / - Vista home con paginación
router.get('/', async (req, res, next) => {
  try {
    const { limit, page, sort, query } = req.query;
    
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const pageNum = page ? parseInt(page, 10) : 1;

    const { products, pagination } = await pm.getPaginated({
      limit: limitNum,
      page: pageNum,
      sort,
      query
    });

    // Construir links de paginación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const queryParams = new URLSearchParams();
    
    if (limitNum !== 10) queryParams.set('limit', limitNum);
    if (query) queryParams.set('query', query);
    if (sort) queryParams.set('sort', sort);
    
    const queryString = queryParams.toString();
    const urlPrefix = baseUrl + (queryString ? `?${queryString}&` : '?');

    const prevLink = pagination.hasPrevPage 
      ? `${urlPrefix}page=${pagination.prevPage}`
      : null;
    
    const nextLink = pagination.hasNextPage 
      ? `${urlPrefix}page=${pagination.nextPage}`
      : null;

    res.render('home', {
      title: 'Productos - Home',
      products,
      query: query || '',
      sort: sort || '',
      pagination: {
        ...pagination,
        limit: limitNum,
        prevLink,
        nextLink
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /products/:pid - Vista de detalle de producto
router.get('/products/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await pm.getById(pid);
    
    if (!product) {
      return res.status(404).render('error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe'
      });
    }

    res.render('productDetail', {
      title: `${product.title} - Detalle`,
      product
    });
  } catch (err) {
    next(err);
  }
});

// GET /carts/:cid - Vista de carrito específico
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const cart = await cm.getById(cid);
    
    if (!cart) {
      return res.status(404).render('error', {
        title: 'Carrito no encontrado',
        message: 'El carrito solicitado no existe'
      });
    }

    res.render('cart', {
      title: 'Carrito',
      cart: {
        id: cart._id,
        products: cart.products || []
      }
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


