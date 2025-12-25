import { Router } from 'express';
import { CartManager } from '../storage/CartManager.js';
import { ProductManager } from '../storage/ProductManager.js';

const router = Router();
const cm = new CartManager();
const pm = new ProductManager();


// POST /api/carts - Crear carrito
router.post('/', async (_req, res, next) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
});

// GET /api/carts/:cid - Obtener carrito con populate
router.get('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const cart = await cm.getById(cid);
    if (!cart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart not found' 
      });
    }
    res.json({ status: 'success', payload: cart.products });
  } catch (err) {
    next(err);
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    const product = await pm.getById(pid);
    if (!product) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Product not found' 
      });
    }

    const updatedCart = await cm.addProduct(cid, pid, 1);
    if (!updatedCart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart not found' 
      });
    }
    res.status(201).json({ status: 'success', payload: updatedCart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cm.removeProduct(cid, pid);
    if (!updatedCart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart or product not found' 
      });
    }
    res.json({ status: 'success', payload: updatedCart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid - Actualizar todos los productos del carrito
router.put('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'products must be an array' 
      });
    }

    const updatedCart = await cm.updateCart(cid, products);
    if (!updatedCart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart not found' 
      });
    }
    res.json({ status: 'success', payload: updatedCart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de producto
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'quantity must be a positive number' 
      });
    }

    const updatedCart = await cm.updateProductQuantity(cid, pid, quantity);
    if (!updatedCart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart or product not found' 
      });
    }
    res.json({ status: 'success', payload: updatedCart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/carts/:cid - Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cm.clearCart(cid);
    if (!updatedCart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Cart not found' 
      });
    }
    res.json({ status: 'success', payload: updatedCart });
  } catch (err) {
    next(err);
  }
});

export default router;