import { Router } from 'express';
import { CartManager } from '../storage/CartManager.js';
import { ProductManager } from '../storage/ProductManager.js';
import { resolvePath } from '../utils/paths.js';


const router = Router();
const cartsPath = resolvePath('data/carts.json');
const productsPath = resolvePath('data/products.json');


const cm = new CartManager(cartsPath);
const pm = new ProductManager(productsPath);


router.post('/', async (_req, res, next) => {
try {
const cart = await cm.createCart();
res.status(201).json({ status: 'success', payload: cart });
} catch (err) { next(err); }
});


router.get('/:cid', async (req, res, next) => {
try {
const { cid } = req.params;
const cart = await cm.getById(cid);
if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
res.json({ status: 'success', payload: cart.products });
} catch (err) { next(err); }
});


router.post('/:cid/product/:pid', async (req, res, next) => {
try {
const { cid, pid } = req.params;

const product = await pm.getById(pid);
if (!product) return res.status(404).json({ status: 'error', error: 'Product not found' });


const updatedCart = await cm.addProduct(cid, pid, 1);
if (!updatedCart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
res.status(201).json({ status: 'success', payload: updatedCart });
} catch (err) { next(err); }
});


export default router;